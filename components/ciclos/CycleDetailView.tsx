"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { BackButton, ColorChip, SectionLabel } from "@/components/ui/Bits";
import { StatusCard } from "@/components/ciclos/StatusCard";
import { IssueListDialog } from "@/components/ciclos/IssueListDialog";
import { STATUS_DEFS } from "@/lib/mock-issues";
import { STATUS_ICONS } from "@/components/ciclos/statusIcons";
import { fmtCycleRange, fmtDate } from "@/lib/format";
import { useAppShell } from "@/components/AppShellContext";
import { useBreadcrumbs } from "@/components/layout/BreadcrumbsContext";
import type { Cycle, IssueStatus } from "@/lib/types";

export function CycleDetailView({ cycle }: { cycle: Cycle }) {
  const router = useRouter();
  const { issues } = useAppShell();
  const [openStatus, setOpenStatus] = useState<IssueStatus | null>(null);
  const cycleIssues = issues.filter((i) => i.cycleId === cycle.id);

  useBreadcrumbs([{ label: "Ciclos", href: "/ciclos" }, { label: `Cycle ${cycle.number}` }]);

  return (
    <Box sx={{ px: 3.5, py: 3.25, pb: 7.5 }}>
      <BackButton onClick={() => router.push("/ciclos")}>Ciclos</BackButton>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 2.5 }}>
        <Typography sx={{ fontFamily: "var(--font-space-grotesk)", fontWeight: 700, fontSize: 22 }}>Cycle {cycle.number}</Typography>
        {cycle.current && <ColorChip color="#9614d0">atual</ColorChip>}
        <Typography sx={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 12, color: "text.disabled" }}>{fmtCycleRange(cycle)}</Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 3.75 }}>
        {STATUS_DEFS.map((def) => {
          const count = cycleIssues.filter((i) => i.status === def.key).length;
          if (def.key === "cancelado" && count === 0) return null;
          return <StatusCard key={def.key} icon={STATUS_ICONS[def.key]} label={def.label} count={count} onClick={() => setOpenStatus(def.key)} />;
        })}
      </Box>

      <SectionLabel>Todas as issues do cycle</SectionLabel>
      <Card sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {["ID", "Team", "Nome", "Status", "Tamanho", "Atualização", "Labels", "Milestone · Projeto"].map((h) => (
                <TableCell key={h} sx={{ whiteSpace: "nowrap" }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {cycleIssues.map((iss) => (
              <TableRow key={iss.id} hover onClick={() => router.push(`/ciclos/${cycle.id}/issue/${iss.id}`)} sx={{ cursor: "pointer" }}>
                <TableCell sx={{ fontFamily: "var(--font-jetbrains-mono)", color: "primary.main", whiteSpace: "nowrap" }}>{iss.id}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{iss.team}</TableCell>
                <TableCell sx={{ minWidth: 220 }}>{iss.name}</TableCell>
                <TableCell>
                  <ColorChip outline>{STATUS_DEFS.find((s) => s.key === iss.status)?.label}</ColorChip>
                </TableCell>
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
                <TableCell sx={{ minWidth: 200 }}>
                  {iss.milestone} — {iss.project}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {openStatus && (
        <IssueListDialog
          statusKey={openStatus}
          statusLabel={STATUS_DEFS.find((s) => s.key === openStatus)!.label}
          issues={cycleIssues.filter((i) => i.status === openStatus)}
          onClose={() => setOpenStatus(null)}
          onOpenIssue={(iss) => {
            setOpenStatus(null);
            router.push(`/ciclos/${cycle.id}/issue/${iss.id}`);
          }}
        />
      )}
    </Box>
  );
}
