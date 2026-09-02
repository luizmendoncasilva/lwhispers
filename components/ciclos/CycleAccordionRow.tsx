"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ChevronDownIcon, ChevronUpIcon, ArrowUpRightIcon } from "@heroicons/react/24/outline";
import { ColorChip } from "@/components/ui/Bits";
import { STATUS_DEFS } from "@/lib/mock-issues";
import { fmtCycleRange } from "@/lib/format";
import { useAppShell } from "@/components/AppShellContext";
import type { Cycle } from "@/lib/types";

export function CycleAccordionRow({ cycle, expanded, onToggle }: { cycle: Cycle; expanded: boolean; onToggle: () => void }) {
  const router = useRouter();
  const { issues } = useAppShell();
  const myIssues = issues.filter((i) => i.cycleId === cycle.id);

  return (
    <Card sx={{ overflow: "hidden" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.75, cursor: "pointer" }} onClick={onToggle}>
        <Box
          component="button"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            router.push(`/ciclos/${cycle.id}`);
          }}
          sx={{ background: "none", border: "none", p: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 1.25 }}
        >
          <Typography sx={{ fontFamily: "var(--font-space-grotesk)", fontWeight: 600, fontSize: 14.5 }}>Cycle {cycle.number}</Typography>
          {cycle.current && <ColorChip color="#9614d0">atual</ColorChip>}
          <ArrowUpRightIcon width={13} height={13} />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.75 }}>
          <Typography sx={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11.5, color: "text.disabled" }}>{fmtCycleRange(cycle)}</Typography>
          <ColorChip>{myIssues.length} minhas</ColorChip>
          {expanded ? <ChevronUpIcon width={16} height={16} /> : <ChevronDownIcon width={16} height={16} />}
        </Box>
      </Box>
      {expanded && (
        <Box sx={{ borderTop: "1px solid", borderColor: "divider", px: 2, pt: 1.25, pb: 1.75, display: "flex", flexDirection: "column", gap: 0.5 }}>
          {myIssues.map((iss) => (
            <Box
              key={iss.id}
              component="button"
              onClick={() => router.push(`/ciclos/${cycle.id}/issue/${iss.id}`)}
              sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 1.25, py: 1, borderRadius: 1.5, border: "none", bgcolor: "transparent", cursor: "pointer", textAlign: "left" }}
            >
              <Typography sx={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11.5, color: "primary.main", flexShrink: 0 }}>{iss.id}</Typography>
              <Typography sx={{ fontSize: 13, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{iss.name}</Typography>
              <ColorChip outline>{STATUS_DEFS.find((s) => s.key === iss.status)?.label}</ColorChip>
            </Box>
          ))}
          {myIssues.length === 0 && <Typography sx={{ fontSize: 12.5, color: "text.disabled", px: 1.25, py: 0.75 }}>Nenhuma issue sua neste cycle.</Typography>}
        </Box>
      )}
    </Card>
  );
}
