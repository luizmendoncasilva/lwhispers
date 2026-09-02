"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { MagnifyingGlassIcon, Squares2X2Icon, ListBulletIcon } from "@heroicons/react/24/outline";
import { IconBtn } from "@/components/ui/Bits";
import { CycleSwitcherButton } from "@/components/shared/CycleSwitcher";
import { TaskTable } from "@/components/tasks/TaskTable";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { useAppShell } from "@/components/AppShellContext";
import { updateTarefaCampos } from "@/actions/tarefas";
import { monthRange } from "@/lib/format";
import type { Cycle, Task } from "@/lib/types";

export function TarefasView({ tasks }: { tasks: Task[] }) {
  const router = useRouter();
  const { issues, openTask } = useAppShell();
  const [local, setLocal] = useState(tasks);
  const [, startTransition] = useTransition();
  const defaultRange = monthRange();
  const [search, setSearch] = useState("");
  const [dateStart, setDateStart] = useState(defaultRange.start);
  const [dateEnd, setDateEnd] = useState(defaultRange.end);
  const [cycleFilter, setCycleFilter] = useState<Cycle | null>(null);
  const [view, setView] = useState<"kanban" | "lista">("lista");

  useEffect(() => setLocal(tasks), [tasks]);

  const filtered = local.filter((tk) => {
    if (search && !tk.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (tk.start && dateStart && tk.start < dateStart) return false;
    if (tk.start && dateEnd && tk.start > dateEnd) return false;
    if (cycleFilter) {
      const hasIssueInCycle = tk.relatedIssueIds.some((id) => {
        const iss = issues.find((i) => i.id === id);
        return iss && iss.cycleId === cycleFilter.id;
      });
      if (!hasIssueInCycle) return false;
    }
    return true;
  });

  return (
    <Box sx={{ px: 3.5, py: 3.25, pb: 7.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap", mb: 2.5 }}>
        <Box sx={{ position: "relative", flex: "1 1 220px", minWidth: 200 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar tarefa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{ input: { startAdornment: <MagnifyingGlassIcon width={14} height={14} style={{ marginRight: 8, opacity: 0.5 }} /> } }}
          />
        </Box>
        <TextField type="date" size="small" value={dateStart} onChange={(e) => setDateStart(e.target.value)} sx={{ width: 155 }} />
        <Typography sx={{ color: "text.disabled", fontSize: 12 }}>até</Typography>
        <TextField type="date" size="small" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} sx={{ width: 155 }} />
        <CycleSwitcherButton selectedCycle={cycleFilter} onSelect={setCycleFilter} label={cycleFilter ? `Cycle ${cycleFilter.number}` : "Filtrar por cycle"} />
        <Box sx={{ ml: "auto", display: "flex", gap: 0.75 }}>
          <IconBtn active={view === "kanban"} onClick={() => setView("kanban")}>
            <Squares2X2Icon width={14} height={14} />
          </IconBtn>
          <IconBtn active={view === "lista"} onClick={() => setView("lista")}>
            <ListBulletIcon width={14} height={14} />
          </IconBtn>
        </Box>
      </Box>

      {view === "lista" ? (
        <TaskTable tasks={filtered} showStatus showDemand onOpenTask={openTask} />
      ) : (
        <KanbanBoard
          tasks={filtered}
          onOpenTask={openTask}
          onStatusChange={(task, status, completionDate) => {
            setLocal((prev) =>
              prev.map((t) => (t.id === task.id ? { ...t, status: status.name, end: completionDate || t.end } : t))
            );
            updateTarefaCampos(task.id, { statusId: status.id, ...(completionDate ? { dataFim: completionDate } : {}) }).then(() =>
              startTransition(() => router.refresh())
            );
          }}
        />
      )}
    </Box>
  );
}
