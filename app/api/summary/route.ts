import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { demandaInclude, serializeDemanda } from "@/lib/serialize";
import { getCachedIssuesAndCycles } from "@/lib/linear";
import { generateSummary } from "@/lib/ai";
import { completedYesterday, generateDailySummary, generateWeeklySummary, TODAY } from "@/lib/summary";
import { weekRange } from "@/lib/format";

export async function POST(request: Request) {
  const { kind } = (await request.json().catch(() => ({}))) as { kind?: "daily" | "weekly" };
  if (kind !== "daily" && kind !== "weekly") {
    return NextResponse.json({ error: "kind deve ser 'daily' ou 'weekly'" }, { status: 400 });
  }

  const [rows, { issues }] = await Promise.all([prisma.demanda.findMany({ include: demandaInclude }), getCachedIssuesAndCycles()]);
  const demands = rows.map(serializeDemanda);

  let prompt: string;
  if (kind === "daily") {
    const done = completedYesterday(demands);
    const inProgress = demands.flatMap((d) => d.tasks.filter((t) => t.status === "Em andamento").map((t) => ({ demand: d, task: t })));
    prompt = [
      "Você é um assistente que escreve resumos diários de trabalho curtos e objetivos, em português do Brasil, pra um Product Designer.",
      "Escreva 3 a 5 frases corridas (sem markdown, sem bullet points) contando: o que foi concluído, se alguma issue do Linear foi finalizada junto, e o que está em andamento agora. Tom direto, profissional, sem enrolação.",
      "",
      `Tarefas concluídas ontem: ${done.length === 0 ? "nenhuma" : done.map((d) => `"${d.task.name}" (demanda ${d.demand.name})`).join("; ")}.`,
      `Tarefas em andamento agora: ${inProgress.length === 0 ? "nenhuma" : inProgress.map((d) => `"${d.task.name}" (demanda ${d.demand.name})`).join("; ")}.`,
      `Issues do Linear ligadas às demandas com tarefas concluídas: ${
        done
          .flatMap(({ demand }) => demand.relatedIssueIds.map((id) => issues.find((i) => i.id === id)).filter(Boolean))
          .map((i) => `${i!.id} (${i!.status})`)
          .join(", ") || "nenhuma"
      }.`,
    ].join("\n");
  } else {
    const { start, end } = weekRange(new Date(TODAY + "T00:00:00"));
    const perDemand = demands
      .map((d) => {
        const tasksThisWeek = d.tasks.filter((t) => t.start && t.start <= end && (t.end || t.start)! >= start);
        return { demand: d, tasksThisWeek };
      })
      .filter((x) => x.tasksThisWeek.length > 0);

    prompt = [
      "Você é um assistente que escreve resumos semanais de trabalho pra um Product Designer, em português do Brasil.",
      "Escreva um parágrafo corrido por demanda que teve movimentação essa semana (sem markdown, sem bullets), citando quantas tarefas foram concluídas e quais estão em andamento, com um tom direto e profissional.",
      "",
      `Semana de ${start} a ${end}.`,
      ...perDemand.map(
        ({ demand, tasksThisWeek }) =>
          `Demanda "${demand.name}": ${tasksThisWeek
            .map((t) => `"${t.name}" (${t.status})`)
            .join(", ")}.`
      ),
    ].join("\n");
  }

  try {
    const summary = await generateSummary(prompt);
    return NextResponse.json({ summary, source: "gemini" });
  } catch (err) {
    console.error("Falha ao gerar resumo via Gemini, usando fallback local:", (err as Error).message);
    const fallback = kind === "daily" ? generateDailySummary(demands, issues) : generateWeeklySummary(demands);
    return NextResponse.json({ summary: fallback, source: "local", error: (err as Error).message });
  }
}
