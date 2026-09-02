import type { Prisma } from "@prisma/client";
import type { Decision, Demand, FileItem, LinkItem, StakeholderUpdate, Task } from "./types";

export const demandaInclude = {
  frente: true,
  status: true,
  pessoas: true,
  wlabels: true,
  arquivos: true,
  links: true,
  issuesLigadas: true,
  decisoes: true,
  stakeholderUpdates: true,
  bloqueadaPor: true,
  bloqueiaOutras: true,
  tarefas: {
    include: {
      status: true,
      pessoas: true,
      labels: true,
      arquivos: true,
      links: true,
      issuesLigadas: true,
      subtarefas: true,
      atividade: true,
    },
    orderBy: { createdAt: "asc" as const },
  },
} satisfies Prisma.DemandaInclude;

export type DemandaWithRelations = Prisma.DemandaGetPayload<{ include: typeof demandaInclude }>;
export type TarefaWithRelations = DemandaWithRelations["tarefas"][number];

function mapFiles(files: { id: string; nome: string; url: string | null }[]): FileItem[] {
  return files.map((f) => ({ id: f.id, name: f.nome, url: f.url ?? undefined }));
}
function mapLinks(links: { id: string; nome: string; url: string }[]): LinkItem[] {
  return links.map((l) => ({ id: l.id, name: l.nome, url: l.url }));
}

export function serializeTarefa(t: TarefaWithRelations, demandId?: string, demandName?: string): Task {
  return {
    id: t.id,
    numero: t.numero,
    demandId,
    demandName,
    name: t.nome,
    status: t.status.nome,
    description: t.descricao ?? "",
    files: mapFiles(t.arquivos),
    people: t.pessoas.map((p) => p.nome),
    links: mapLinks(t.links),
    trackedSeconds: t.tempoRastreado,
    relatedIssueIds: t.issuesLigadas.map((i) => i.issueId),
    start: t.dataInicio,
    end: t.dataFim,
    size: t.tamanho,
    labels: t.labels.map((l) => l.nome),
    subtasks: t.subtarefas.map((s) => ({ id: s.id, name: s.nome, done: s.concluida })),
    activity: t.atividade
      .slice()
      .sort((a, b) => a.criadaEm.getTime() - b.criadaEm.getTime())
      .map((a) => ({ id: a.id, author: a.autor, at: a.criadaEm.toISOString(), text: a.texto, subtaskId: a.subtarefaId })),
  };
}

export function serializeDemanda(d: DemandaWithRelations): Demand {
  const decisions: Decision[] = d.decisoes
    .slice()
    .sort((a, b) => a.criadaEm.getTime() - b.criadaEm.getTime())
    .map((dec) => ({ id: dec.id, text: dec.texto, author: dec.autor, at: dec.criadaEm.toISOString() }));
  const stakeholderUpdates: StakeholderUpdate[] = d.stakeholderUpdates.map((s) => ({ person: s.pessoaNome, lastSentAt: s.ultimoEnvio }));

  return {
    id: d.id,
    frenteId: d.frenteId,
    name: d.nome,
    status: d.status.nome,
    start: d.dataInicio,
    end: d.dataFim,
    repo: d.repositorio ?? "",
    files: mapFiles(d.arquivos),
    people: d.pessoas.map((p) => p.nome),
    links: mapLinks(d.links),
    wlabels: d.wlabels.map((w) => w.id),
    observations: d.observacoes ?? "",
    relatedIssueIds: d.issuesLigadas.map((i) => i.issueId),
    tasks: d.tarefas.map((t) => serializeTarefa(t, d.id, d.nome)),
    skills: d.skills,
    decisions,
    blockedBy: d.bloqueadaPor.map((b) => b.bloqueiaId),
    blocks: d.bloqueiaOutras.map((b) => b.demandaId),
    stakeholderUpdates,
  };
}
