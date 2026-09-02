"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { MagnifyingGlassIcon, Squares2X2Icon, ListBulletIcon } from "@heroicons/react/24/outline";
import { IconBtn } from "@/components/ui/Bits";
import { CycleSwitcherButton } from "@/components/shared/CycleSwitcher";
import { TaskTable } from "@/components/tasks/TaskTable";
import { TaskCard } from "@/components/tasks/TaskCard";
import { useAppShell } from "@/components/AppShellContext";
import { monthRange } from "@/lib/format";
import type { Cycle, Task } from "@/lib/types";

export function TarefasView({ tasks }: { tasks: Task[] }) {
  const { issues, openTask } = useAppShell();
  const defaultRange = monthRange();
  const [search, setSearch] = useState("");
  const [dateStart, setDateStart] = useState(defaultRange.start);
  const [dateEnd, setDateEnd] = useState(defaultRange.end);
  const [cycleFilter, setCycleFilter] = useState<Cycle | null>(null);
  const [view, setView] = useState<"kanban" | "lista">("lista");

  const filtered = tasks.filter((tk) => {
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
        <Box sx={{ display: "flex", gap: 1.5, overflowX: "auto", pb: 0.75 }}>
          {["Backlog", "Em andamento", "Bloqueado", "Revisão", "Concluído"].map((status) => (
            <Box key={status} sx={{ minWidth: 220, flex: "1 0 220px" }}>
              <Typography sx={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 10.5, color: "text.disabled", mb: 1, letterSpacing: 0.3 }}>
                {status.toUpperCase()} · {filtered.filter((tk) => tk.status === status).length}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {filtered
                  .filter((tk) => tk.status === status)
                  .map((tk) => (
                    <TaskCard key={tk.id} task={tk} onClick={() => openTask(tk)} />
                  ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
