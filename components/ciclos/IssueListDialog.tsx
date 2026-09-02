"use client";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ColorChip } from "@/components/ui/Bits";
import { useAppShell } from "@/components/AppShellContext";
import { fmtDate } from "@/lib/format";
import { STATUS_ICONS } from "@/components/ciclos/statusIcons";
import type { Issue, IssueStatus } from "@/lib/types";

export function IssueListDialog({
  statusKey,
  statusLabel,
  issues,
  onClose,
  onOpenIssue,
}: {
  statusKey: IssueStatus;
  statusLabel: string;
  issues: Issue[];
  onClose: () => void;
  onOpenIssue: (issue: Issue) => void;
}) {
  const Icon = STATUS_ICONS[statusKey];
  const { cycles } = useAppShell();
  return (
    <Dialog open onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.1 }}>
          <Icon width={16} height={16} />
          <Typography sx={{ fontFamily: "var(--font-space-grotesk)", fontWeight: 600, fontSize: 16 }}>{statusLabel}</Typography>
          <ColorChip>{issues.length} issues</ColorChip>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <XMarkIcon width={16} height={16} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ overflowX: "auto", p: 0 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {["ID", "Team", "Nome", "Criação", "Tamanho", "Atualização", "Labels", "Cycle", "Milestone · Projeto"].map((h) => (
                <TableCell key={h} sx={{ whiteSpace: "nowrap" }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {issues.map((iss) => (
              <TableRow key={iss.id} hover onClick={() => onOpenIssue(iss)} sx={{ cursor: "pointer" }}>
                <TableCell sx={{ fontFamily: "var(--font-jetbrains-mono)", color: "primary.main", whiteSpace: "nowrap" }}>{iss.id}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{iss.team}</TableCell>
                <TableCell sx={{ minWidth: 240 }}>{iss.name}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{fmtDate(iss.createdAt)}</TableCell>
                <TableCell>
                  <ColorChip>{iss.size}</ColorChip>
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{fmtDate(iss.updatedAt)}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    {iss.labels.map((l) => (
                      <ColorChip key={l}>{l}</ColorChip>
                    ))}
                  </Box>
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>#{cycles.find((c) => c.id === iss.cycleId)?.number}</TableCell>
                <TableCell sx={{ minWidth: 220 }}>
                  {iss.milestone} — {iss.project}
                </TableCell>
              </TableRow>
            ))}
            {issues.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} sx={{ textAlign: "center", color: "text.disabled", py: 4 }}>
                  Nenhuma issue neste status.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
