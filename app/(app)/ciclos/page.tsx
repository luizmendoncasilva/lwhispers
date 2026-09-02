"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { CycleAccordionRow } from "@/components/ciclos/CycleAccordionRow";
import { useAppShell } from "@/components/AppShellContext";
import { syncLinearNow } from "@/actions/linear";

export default function CiclosPage() {
  const router = useRouter();
  const { cycles, currentCycle } = useAppShell();
  const [expandedId, setExpandedId] = useState<string | null>(currentCycle?.id ?? null);
  const [syncing, setSyncing] = useState(false);

  return (
    <Box sx={{ px: 3.5, py: 3.25, pb: 7.5, display: "flex", flexDirection: "column", gap: 1.25, maxWidth: 780 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<ArrowPathIcon width={13} height={13} />}
          disabled={syncing}
          onClick={async () => {
            setSyncing(true);
            await syncLinearNow();
            router.refresh();
            setSyncing(false);
          }}
        >
          {syncing ? "Sincronizando..." : "Sincronizar com o Linear"}
        </Button>
      </Box>
      {cycles.length === 0 && (
        <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
          Nenhum cycle encontrado ainda — clique em &quot;Sincronizar com o Linear&quot; pra buscar suas issues.
        </Typography>
      )}
      {cycles
        .slice()
        .reverse()
        .map((c) => (
          <CycleAccordionRow key={c.id} cycle={c} expanded={expandedId === c.id} onToggle={() => setExpandedId(expandedId === c.id ? null : c.id)} />
        ))}
    </Box>
  );
}
