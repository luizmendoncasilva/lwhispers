import type { Demand, Issue } from "./types";
import { fmtDate, fmtHM, weekRange } from "./format";

export const TODAY = "2026-09-01";

// Tarefas concluídas "ontem" — no protótipo isso vinha fixo (mock); aqui referenciamos
// as mesmas tarefas semeadas (t1, t5) até a Fase 3/4 trazerem isso de dados reais de atividade.
export const COMPLETED_YESTERDAY: { demandId: string; taskId: string }[] = [
  { demandId: "d1", taskId: "t1" },
  { demandId: "d2", taskId: "t5" },
];

export function completedYesterday(demands: Demand[]) {
  return COMPLETED_YESTERDAY.map(({ demandId, taskId }) => {
    const d = demands.find((x) => x.id === demandId);
    const tk = d?.tasks.find((x) => x.id === taskId);
    return tk && d ? { demand: d, task: tk } : null;
  }).filter((x): x is { demand: Demand; task: Demand["tasks"][number] } => Boolean(x));
}

export function generateDailySummary(demands: Demand[], issues: Issue[]): string {
  const completedTasks = completedYesterday(demands);
  const finalizedIssues: Issue[] = [];
  completedTasks.forEach(({ demand }) => {
    demand.relatedIssueIds.forEach((id) => {
      const iss = issues.find((i) => i.id === id);
      if (iss && iss.status === "concluido" && !finalizedIssues.find((x) => x.id === iss.id)) finalizedIssues.push(iss);
    });
  });

  const inProgress = demands.flatMap((d) => d.tasks.filter((tk) => tk.status === "Em andamento").map((tk) => ({ demand: d, task: tk })));

  const sentences: string[] = [];
  if (completedTasks.length === 0) {
    sentences.push("Nenhuma tarefa foi concluída no dia anterior.");
  } else {
    completedTasks.forEach(({ demand, task }) => {
      sentences.push(`"${task.name}" foi concluída, referente à demanda ${demand.name}.`);
    });
  }
  finalizedIssues.forEach((iss) => {
    sentences.push(`A issue ${iss.id} — ${iss.name} — também foi finalizada nesse mesmo processo.`);
  });
  if (inProgress.length > 0) {
    sentences.push(`Atualmente seguem em andamento: ${inProgress.map(({ task }) => `"${task.name}"`).join(", ")}.`);
  } else {
    sentences.push("No momento não há tarefas em andamento.");
  }
  return sentences.join(" ");
}

export function generateWeeklySummary(demands: Demand[]): string {
  const { start, end } = weekRange(new Date(TODAY + "T00:00:00"));
  const perDemand = demands
    .map((d) => {
      const tasksThisWeek = d.tasks.filter((tk) => tk.start && tk.start <= end && (tk.end || tk.start)! >= start);
      const done = tasksThisWeek.filter((tk) => tk.status === "Concluído");
      const inProgress = tasksThisWeek.filter((tk) => tk.status === "Em andamento");
      return { demand: d, done, inProgress, seconds: tasksThisWeek.reduce((a, tk) => a + (tk.trackedSeconds || 0), 0) };
    })
    .filter((x) => x.done.length > 0 || x.inProgress.length > 0);

  if (perDemand.length === 0) return "Nenhuma movimentação de tarefas registrada nesta semana.";

  const lines = [`Resumo da semana de ${fmtDate(start)} a ${fmtDate(end)}:`];
  perDemand.forEach(({ demand, done, inProgress, seconds }) => {
    lines.push(
      `\n${demand.name} (${fmtHM(seconds)} rastreadas): ${done.length} tarefa(s) concluída(s)${
        done.length ? " — " + done.map((t) => t.name).join(", ") : ""
      }; ${inProgress.length} em andamento${inProgress.length ? " — " + inProgress.map((t) => t.name).join(", ") : ""}.`
    );
  });
  return lines.join(" ");
}
