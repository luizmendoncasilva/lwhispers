"use client";

import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ColorChip } from "@/components/ui/Bits";
import { LabelBadges, IssueBadgesCell } from "@/components/shared/IssueBadges";
import { useConfigLists } from "@/components/ConfigListsContext";
import { useAppShell } from "@/components/AppShellContext";
import { fmtDate, fmtHM, fmtHMS } from "@/lib/format";
import type { Task } from "@/lib/types";

export function TaskTable({
  tasks,
  showStatus,
  showDemand,
  onOpenTask,
}: {
  tasks: Task[];
  showStatus?: boolean;
  showDemand?: boolean;
  onOpenTask: (task: Task) => void;
}) {
  const { statusTarefa } = useConfigLists();
  const { timer, now, goToIssue } = useAppShell();
  const cols = ["ID", "Nome", "Início", "Fim", "Tamanho", "Rastreado", ...(showStatus ? ["Status"] : []), "Labels", "Issues relacionadas"];

  return (
    <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {cols.map((h) => (
              <TableCell key={h} sx={{ whiteSpace: "nowrap" }}>
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.map((tk) => {
            const isRunning = timer?.taskId === tk.id;
            const seconds = isRunning ? Math.floor((now - timer!.startedAt) / 1000) + timer!.baseSeconds : tk.trackedSeconds;
            return (
              <TableRow key={tk.id} hover onClick={() => onOpenTask(tk)} sx={{ cursor: "pointer" }}>
                <TableCell sx={{ whiteSpace: "nowrap", fontFamily: "var(--font-jetbrains-mono)", color: "text.disabled" }}>T-{tk.numero}</TableCell>
                <TableCell sx={{ minWidth: 200 }}>
                  <Typography sx={{ fontSize: 13 }}>{tk.name}</Typography>
                  {showDemand && tk.demandName && (
                    <Typography sx={{ fontSize: 10.5, color: "text.disabled", mt: 0.2 }}>{tk.demandName}</Typography>
                  )}
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{fmtDate(tk.start)}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{fmtDate(tk.end)}</TableCell>
                <TableCell>
                  <ColorChip>{tk.size}</ColorChip>
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap", fontFamily: "var(--font-jetbrains-mono)", color: isRunning ? "primary.main" : "text.secondary" }}>
                  {isRunning ? fmtHMS(seconds) : fmtHM(seconds)}
                </TableCell>
                {showStatus && (
                  <TableCell>
                    <ColorChip color={statusTarefa.find((s) => s.name === tk.status)?.color}>{tk.status}</ColorChip>
                  </TableCell>
                )}
                <TableCell>
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    <LabelBadges names={tk.labels} />
                  </Box>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <IssueBadgesCell ids={tk.relatedIssueIds} onGoToIssue={goToIssue} />
                </TableCell>
              </TableRow>
            );
          })}
          {tasks.length === 0 && (
            <TableRow>
              <TableCell colSpan={cols.length} sx={{ textAlign: "center", color: "text.disabled", py: 4 }}>
                Nenhuma tarefa aqui.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
