// Tipos compartilhados — refletem o modelo de dados do protótipo (LWhispers.jsx)
// e o doc de regras (Linear = somente leitura; Demanda/Tarefa = próprio do L.whispers).

export type IssueStatus =
  | "triage"
  | "pendente"
  | "refinado"
  | "em_andamento"
  | "concluido"
  | "cancelado";

export interface Cycle {
  id: string;
  number: number;
  start: string;
  end: string;
  current?: boolean;
}

export interface Activity {
  id: string;
  type?: "created" | "comment";
  author: string;
  at: string;
  text?: string;
  subtaskId?: string | null;
}

export interface Issue {
  id: string;
  team: string;
  name: string;
  createdAt: string;
  size: string;
  updatedAt: string;
  labels: string[];
  cycleId: string;
  milestone: string;
  project: string;
  status: IssueStatus;
  priority: string;
  description: string;
  activity: Activity[];
  url: string;
}

export interface Frente {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface WLabel {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface MetaStatus {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface LinkItem {
  id: string;
  name: string;
  url: string;
}

export interface FileItem {
  id: string;
  name: string;
  url?: string;
}

export interface Subtask {
  id: string;
  name: string;
  done: boolean;
}

export interface Decision {
  id: string;
  text: string;
  author: string;
  at: string;
}

export interface StakeholderUpdate {
  person: string;
  lastSentAt: string;
}

export interface Task {
  id: string;
  numero: number;
  demandId?: string;
  demandName?: string;
  name: string;
  status: string;
  description: string;
  files: FileItem[];
  people: string[];
  links: LinkItem[];
  trackedSeconds: number;
  relatedIssueIds: string[];
  start: string | null;
  end: string | null;
  size: string;
  labels: string[];
  subtasks?: Subtask[];
  activity?: Activity[];
}

export interface Demand {
  id: string;
  frenteId: string;
  name: string;
  status: string;
  start: string;
  end: string | null;
  repo: string;
  files: FileItem[];
  people: string[];
  links: LinkItem[];
  wlabels: string[];
  observations: string;
  relatedIssueIds: string[];
  tasks: Task[];
  skills?: string[];
  decisions?: Decision[];
  blockedBy?: string[];
  blocks?: string[];
  stakeholderUpdates?: StakeholderUpdate[];
}

export interface Timer {
  demandId: string;
  taskId: string;
  taskName: string;
  startedAt: number;
  baseSeconds: number;
}
