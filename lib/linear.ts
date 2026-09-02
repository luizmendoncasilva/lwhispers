import { prisma } from "@/lib/db";
import type { Activity, Cycle, Issue, IssueStatus } from "@/lib/types";

const LINEAR_API = "https://api.linear.app/graphql";

async function linearFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const key = process.env.LINEAR_API_KEY;
  if (!key) throw new Error("LINEAR_API_KEY não configurada em .env.local");
  const res = await fetch(LINEAR_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: key },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map((e: { message: string }) => e.message).join("; "));
  return json.data as T;
}

// Estado Linear (state.type) -> nossas 6 colunas fixas de status.
const STATE_TYPE_TO_STATUS: Record<string, IssueStatus> = {
  triage: "triage",
  backlog: "pendente",
  unstarted: "refinado",
  started: "em_andamento",
  completed: "concluido",
  canceled: "cancelado",
  duplicate: "cancelado",
};
const STATUS_TO_STATE_TYPE: Record<IssueStatus, string> = {
  triage: "triage",
  pendente: "backlog",
  refinado: "unstarted",
  em_andamento: "started",
  concluido: "completed",
  cancelado: "canceled",
};
// nome preferido dentro do type (times costumam ter mais de um estado "started"/"canceled")
const PREFERRED_STATE_NAME: Partial<Record<IssueStatus, string>> = {
  em_andamento: "Em andamento",
  cancelado: "Cancelado",
};

const PRIORITY_LABEL_PT: Record<number, string> = { 0: "Sem prioridade", 1: "Urgente", 2: "Alta", 3: "Média", 4: "Baixa" };

export const ESTIMATE_OPTIONS = [0, 1, 2, 3, 5, 8, 13, 21];

interface LinearWorkflowState {
  id: string;
  name: string;
  type: string;
}
interface LinearIssueNode {
  id: string;
  identifier: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  estimate: number | null;
  priority: number;
  description: string | null;
  url: string;
  labels: { nodes: { name: string }[] };
  state: LinearWorkflowState;
  team: { id: string; name: string; key: string; states: { nodes: LinearWorkflowState[] } };
  project: { name: string } | null;
  projectMilestone: { name: string } | null;
  cycle: { id: string; number: number; startsAt: string; endsAt: string } | null;
  creator: { name: string } | null;
  comments: { nodes: { id: string; body: string; createdAt: string; user: { name: string } | null }[] };
}

const MY_ISSUES_QUERY = `
  query MyIssues {
    issues(filter: { assignee: { isMe: { eq: true } } }, first: 150, orderBy: updatedAt) {
      nodes {
        id identifier title createdAt updatedAt estimate priority description url
        labels(first: 10) { nodes { name } }
        state { id name type }
        team { id name key states(first: 30) { nodes { id name type } } }
        project { name }
        projectMilestone { name }
        cycle { id number startsAt endsAt }
        creator { name }
        comments(first: 20) { nodes { id body createdAt user { name } } }
      }
    }
  }
`;

interface IssueCacheEntry {
  issue: Issue;
  linearUuid: string;
  teamId: string;
  states: LinearWorkflowState[];
}
interface CycleCacheEntry {
  number: number;
  start: string;
  end: string;
  current: boolean;
  teamCycles: { teamId: string; cycleUuid: string }[];
}

function mapIssue(n: LinearIssueNode, cycleId: string): Issue {
  const activity: Activity[] = [];
  if (n.creator) activity.push({ id: `${n.id}-created`, type: "created", author: n.creator.name, at: n.createdAt });
  n.comments.nodes.forEach((c) =>
    activity.push({ id: c.id, type: "comment", author: c.user?.name || "Linear", at: c.createdAt, text: c.body })
  );
  activity.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  return {
    id: n.identifier,
    team: n.team.name,
    name: n.title,
    createdAt: n.createdAt.slice(0, 10),
    size: n.estimate != null ? String(n.estimate) : "—",
    updatedAt: n.updatedAt.slice(0, 10),
    labels: n.labels.nodes.map((l) => l.name),
    cycleId,
    milestone: n.projectMilestone?.name || "",
    project: n.project?.name || "",
    status: STATE_TYPE_TO_STATUS[n.state.type] || "pendente",
    priority: PRIORITY_LABEL_PT[n.priority] ?? "Sem prioridade",
    description: n.description || "",
    activity,
    url: n.url,
  };
}

/** Busca issues atribuídas a mim + cycles derivados, e grava no cache local (IssueCache/CycleCache). */
export async function syncActiveData(): Promise<{ issueCount: number; cycleCount: number }> {
  const data = await linearFetch<{ issues: { nodes: LinearIssueNode[] } }>(MY_ISSUES_QUERY);
  const now = new Date();

  const cyclesByNumber = new Map<number, CycleCacheEntry>();
  const issueRows: { issueId: string; cycleId: string; dadosJson: IssueCacheEntry }[] = [];

  for (const n of data.issues.nodes) {
    if (!n.cycle) continue; // o app é organizado por cycle — issue sem cycle fica fora por enquanto
    const cycleId = `c${n.cycle.number}`;
    const isActive = new Date(n.cycle.startsAt) <= now && now <= new Date(n.cycle.endsAt);

    const existing = cyclesByNumber.get(n.cycle.number);
    const teamCycles = existing?.teamCycles || [];
    if (!teamCycles.find((t) => t.teamId === n.team.id)) teamCycles.push({ teamId: n.team.id, cycleUuid: n.cycle.id });
    cyclesByNumber.set(n.cycle.number, {
      number: n.cycle.number,
      start: n.cycle.startsAt.slice(0, 10),
      end: n.cycle.endsAt.slice(0, 10),
      current: existing?.current || isActive,
      teamCycles,
    });

    issueRows.push({
      issueId: n.identifier,
      cycleId,
      dadosJson: { issue: mapIssue(n, cycleId), linearUuid: n.id, teamId: n.team.id, states: n.team.states.nodes },
    });
  }

  await prisma.$transaction([
    ...issueRows.map((row) =>
      prisma.issueCache.upsert({
        where: { issueId: row.issueId },
        update: { cycleId: row.cycleId, dadosJson: row.dadosJson as object, atualizadoEm: new Date() },
        create: { issueId: row.issueId, cycleId: row.cycleId, dadosJson: row.dadosJson as object },
      })
    ),
    ...Array.from(cyclesByNumber.entries()).map(([number, entry]) =>
      prisma.cycleCache.upsert({
        where: { cycleId: `c${number}` },
        update: { dadosJson: entry as object, atualizadoEm: new Date() },
        create: { cycleId: `c${number}`, dadosJson: entry as object },
      })
    ),
  ]);

  return { issueCount: issueRows.length, cycleCount: cyclesByNumber.size };
}

export async function getCachedIssuesAndCycles(): Promise<{ issues: Issue[]; cycles: Cycle[] }> {
  const [issueRows, cycleRows] = await Promise.all([prisma.issueCache.findMany(), prisma.cycleCache.findMany()]);
  const issues = issueRows.map((r) => (r.dadosJson as unknown as IssueCacheEntry).issue);
  const cycles: Cycle[] = cycleRows
    .map((r) => {
      const d = r.dadosJson as unknown as CycleCacheEntry;
      return { id: r.cycleId, number: d.number, start: d.start, end: d.end, current: d.current };
    })
    .sort((a, b) => a.number - b.number);
  return { issues, cycles };
}

export interface IssuePatch {
  status?: IssueStatus;
  description?: string;
  size?: string;
  cycleId?: string;
}

const ISSUE_UPDATE_MUTATION = `
  mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
    issueUpdate(id: $id, input: $input) { success }
  }
`;

export async function updateLinearIssue(issueId: string, patch: IssuePatch): Promise<Issue> {
  const row = await prisma.issueCache.findUnique({ where: { issueId } });
  if (!row) throw new Error(`Issue ${issueId} não está no cache local`);
  const entry = row.dadosJson as unknown as IssueCacheEntry;

  const input: Record<string, unknown> = {};
  if (patch.description !== undefined) input.description = patch.description;
  if (patch.size !== undefined) {
    const n = parseInt(patch.size, 10);
    input.estimate = Number.isNaN(n) ? null : n;
  }
  if (patch.status) {
    const wantType = STATUS_TO_STATE_TYPE[patch.status];
    const preferredName = PREFERRED_STATE_NAME[patch.status];
    const state =
      entry.states.find((s) => s.type === wantType && s.name === preferredName) ||
      entry.states.find((s) => s.type === wantType);
    if (state) input.stateId = state.id;
  }
  if (patch.cycleId) {
    const cycleRow = await prisma.cycleCache.findUnique({ where: { cycleId: patch.cycleId } });
    if (cycleRow) {
      const cycleEntry = cycleRow.dadosJson as unknown as CycleCacheEntry;
      const teamCycle = cycleEntry.teamCycles.find((t) => t.teamId === entry.teamId);
      if (teamCycle) input.cycleId = teamCycle.cycleUuid;
    }
  }

  if (Object.keys(input).length > 0) {
    await linearFetch(ISSUE_UPDATE_MUTATION, { id: entry.linearUuid, input });
  }

  const nextIssue: Issue = {
    ...entry.issue,
    ...(patch.description !== undefined ? { description: patch.description } : {}),
    ...(patch.size !== undefined ? { size: patch.size } : {}),
    ...(patch.status ? { status: patch.status } : {}),
    ...(patch.cycleId ? { cycleId: patch.cycleId } : {}),
  };
  const nextEntry: IssueCacheEntry = { ...entry, issue: nextIssue };
  await prisma.issueCache.update({
    where: { issueId },
    data: { cycleId: nextIssue.cycleId, dadosJson: nextEntry as object, atualizadoEm: new Date() },
  });
  return nextIssue;
}

const COMMENT_CREATE_MUTATION = `
  mutation AddComment($issueId: String!, $body: String!) {
    commentCreate(input: { issueId: $issueId, body: $body }) { success }
  }
`;

export async function addLinearComment(issueId: string, body: string, author: string): Promise<Issue> {
  const row = await prisma.issueCache.findUnique({ where: { issueId } });
  if (!row) throw new Error(`Issue ${issueId} não está no cache local`);
  const entry = row.dadosJson as unknown as IssueCacheEntry;

  await linearFetch(COMMENT_CREATE_MUTATION, { issueId: entry.linearUuid, body });

  const activity: Activity[] = [...entry.issue.activity, { id: `local-${Date.now()}`, type: "comment", author, at: new Date().toISOString(), text: body }];
  const nextIssue: Issue = { ...entry.issue, activity };
  const nextEntry: IssueCacheEntry = { ...entry, issue: nextIssue };
  await prisma.issueCache.update({ where: { issueId }, data: { dadosJson: nextEntry as object, atualizadoEm: new Date() } });
  return nextIssue;
}
