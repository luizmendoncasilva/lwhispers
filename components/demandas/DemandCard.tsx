"use client";

import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import { ClockIcon } from "@heroicons/react/24/outline";
import { ColorChip } from "@/components/ui/Bits";
import { useConfigLists } from "@/components/ConfigListsContext";
import { fmtDate, fmtHM } from "@/lib/format";
import type { Demand } from "@/lib/types";

function sumSeconds(demand: Demand) {
  return demand.tasks.reduce((a, t) => a + (t.trackedSeconds || 0), 0);
}
function progress(demand: Demand) {
  if (!demand.tasks.length) return 0;
  const done = demand.tasks.filter((t) => t.status === "Concluído").length;
  return Math.round((done / demand.tasks.length) * 100);
}

export function DemandCard({ demand, onClick }: { demand: Demand; onClick: () => void }) {
  const { frentes, statusDemanda } = useConfigLists();
  const frente = frentes.find((f) => f.id === demand.frenteId);
  const statusColor = statusDemanda.find((s) => s.name === demand.status)?.color;

  return (
    <Card>
      <CardActionArea onClick={onClick} sx={{ p: 2.25 }}>
        <Box sx={{ mb: 1.5, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          {frente && <ColorChip color={frente.color}>{frente.name}</ColorChip>}
          {demand.status && <ColorChip color={statusColor}>{demand.status}</ColorChip>}
        </Box>
        <Typography sx={{ fontFamily: "var(--font-space-grotesk)", fontWeight: 600, fontSize: 15.5, mb: 1.75, lineHeight: 1.3 }}>
          {demand.name}
        </Typography>
        <LinearProgress variant="determinate" value={progress(demand)} sx={{ mb: 1, height: 6, borderRadius: 999 }} />
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "text.disabled" }}>
            {fmtDate(demand.start)} – {demand.end ? fmtDate(demand.end) : "em curso"}
          </Typography>
          <Typography sx={{ display: "flex", alignItems: "center", gap: 0.4, fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "text.disabled" }}>
            <ClockIcon width={11} height={11} /> {fmtHM(sumSeconds(demand))}
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
}
