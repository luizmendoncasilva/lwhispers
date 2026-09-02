"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

function revalidateAll() {
  revalidatePath("/demandas");
  revalidatePath("/dashboard");
  revalidatePath("/tarefas");
}

export async function createTarefa(
  demandaId: string,
  nome: string,
  extra?: Partial<{ statusId: string; tamanho: string; dataInicio: string | null; dataFim: string | null }>
) {
  const t = await prisma.tarefa.create({
    data: {
      demandaId,
      nome,
      statusId: extra?.statusId || "Backlog",
      tamanho: extra?.tamanho || "S",
      dataInicio: extra?.dataInicio ?? new Date().toISOString().slice(0, 10),
      dataFim: extra?.dataFim ?? undefined,
      atividade: { create: { autor: "Sistema", texto: "Tarefa criada." } },
    },
  });
  revalidateAll();
  return t.id;
}

export async function deleteTarefa(id: string) {
  const tarefa = await prisma.tarefa.delete({ where: { id } });
  revalidateAll();
  return tarefa.demandaId;
}

export async function updateTarefaCampos(
  id: string,
  patch: Partial<{ nome: string; descricao: string; statusId: string; tamanho: string; dataInicio: string | null; dataFim: string | null }>
) {
  const before = await prisma.tarefa.findUniqueOrThrow({ where: { id }, include: { status: true } });
  await prisma.tarefa.update({ where: { id }, data: patch });

  const logs: { tarefaId: string; autor: string; texto: string }[] = [];
  if (patch.statusId && patch.statusId !== before.statusId) {
    const nextStatus = await prisma.statusTarefa.findUnique({ where: { id: patch.statusId } });
    logs.push({ tarefaId: id, autor: "Sistema", texto: `Status alterado de "${before.status.nome}" para "${nextStatus?.nome}".` });
  }
  if (patch.tamanho && patch.tamanho !== before.tamanho) {
    logs.push({ tarefaId: id, autor: "Sistema", texto: `Tamanho alterado de "${before.tamanho}" para "${patch.tamanho}".` });
  }
  if (patch.dataInicio !== undefined && patch.dataInicio !== before.dataInicio) {
    logs.push({ tarefaId: id, autor: "Sistema", texto: `Início alterado para ${patch.dataInicio || "—"}.` });
  }
  if (patch.dataFim !== undefined && patch.dataFim !== before.dataFim) {
    logs.push({ tarefaId: id, autor: "Sistema", texto: `Fim alterado para ${patch.dataFim || "—"}.` });
  }
  if (patch.nome && patch.nome !== before.nome) {
    logs.push({ tarefaId: id, autor: "Sistema", texto: `Nome alterado de "${before.nome}" para "${patch.nome}".` });
  }
  if (logs.length > 0) await prisma.atividade.createMany({ data: logs });

  revalidateAll();
}

export async function setTarefaTempoRastreado(id: string, seconds: number) {
  await prisma.tarefa.update({ where: { id }, data: { tempoRastreado: seconds } });
  revalidateAll();
}

export async function setTarefaPessoas(id: string, nomes: string[]) {
  await prisma.tarefa.update({ where: { id }, data: { pessoas: { set: nomes.map((n) => ({ id: n })) } } });
  revalidateAll();
}

export async function setTarefaLabels(id: string, nomes: string[]) {
  const wlabels = await prisma.wLabel.findMany({ where: { nome: { in: nomes } } });
  const ids = nomes.map((n) => wlabels.find((w) => w.nome === n)?.id).filter((x): x is string => Boolean(x));
  await prisma.tarefa.update({ where: { id }, data: { labels: { set: ids.map((i) => ({ id: i })) } } });
  revalidateAll();
}

export async function addTarefaLink(id: string, nome: string, url: string) {
  await prisma.link.create({ data: { nome, url, tarefaId: id } });
  revalidateAll();
}

export async function addTarefaArquivo(id: string, nome: string, url?: string) {
  await prisma.arquivo.create({ data: { nome, url, tarefaId: id } });
  revalidateAll();
}

export async function setTarefaIssuesLigadas(id: string, issueIds: string[]) {
  await prisma.issueLigada.deleteMany({ where: { tarefaId: id } });
  if (issueIds.length > 0) {
    await prisma.issueLigada.createMany({ data: issueIds.map((issueId) => ({ tarefaId: id, issueId })) });
  }
  revalidateAll();
}

export async function addSubtarefa(tarefaId: string, nome: string) {
  await prisma.subtarefa.create({ data: { tarefaId, nome } });
  await prisma.atividade.create({ data: { tarefaId, autor: "Sistema", texto: `Subtarefa "${nome}" criada.` } });
  revalidateAll();
}
export async function toggleSubtarefa(id: string, concluida: boolean) {
  const sub = await prisma.subtarefa.update({ where: { id }, data: { concluida } });
  await prisma.atividade.create({
    data: { tarefaId: sub.tarefaId, autor: "Sistema", texto: `Subtarefa "${sub.nome}" marcada como ${concluida ? "concluída" : "pendente"}.` },
  });
  revalidateAll();
}
export async function removeSubtarefa(id: string) {
  await prisma.subtarefa.delete({ where: { id } });
  revalidateAll();
}

export async function addAtividade(tarefaId: string, texto: string, autor: string, subtarefaId?: string | null) {
  await prisma.atividade.create({ data: { tarefaId, texto, autor, subtarefaId: subtarefaId || null } });
  revalidateAll();
}
