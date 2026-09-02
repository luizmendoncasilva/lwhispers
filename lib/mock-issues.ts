// Vocabulários fixos de UI relacionados a issues do Linear.
// Os dados em si (cycles/issues) vêm de lib/linear.ts + lib/issues-data.ts (Fase 3).
import type { Issue } from "./types";

export const STATUS_DEFS: { key: Issue["status"]; label: string }[] = [
  { key: "triage", label: "Triage" },
  { key: "pendente", label: "Pendente" },
  { key: "refinado", label: "Refinado" },
  { key: "em_andamento", label: "Em andamento" },
  { key: "concluido", label: "Concluído" },
  { key: "cancelado", label: "Canceladas" },
];

// Tamanho da Tarefa (conceito próprio do L.whispers, não é o estimate do Linear).
export const SIZES = ["XS", "S", "M", "L", "XL"];
