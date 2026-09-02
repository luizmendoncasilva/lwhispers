"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import { PlusIcon } from "@heroicons/react/24/outline";
import { DemandCard } from "@/components/demandas/DemandCard";
import { useConfigLists } from "@/components/ConfigListsContext";
import { createDemanda } from "@/actions/demandas";
import type { Demand } from "@/lib/types";

export function DemandasListView({ demands }: { demands: Demand[] }) {
  const router = useRouter();
  const { frentes } = useConfigLists();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [frenteId, setFrenteId] = useState(frentes[0]?.id || "");

  async function create() {
    if (!name.trim()) return;
    const id = await createDemanda(name.trim(), frenteId);
    setName("");
    setCreating(false);
    router.push(`/demandas/${id}`);
  }

  return (
    <Box sx={{ px: 3.5, py: 3.25, pb: 7.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
        <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>{demands.length} demandas ativas</Typography>
        <Button startIcon={<PlusIcon width={14} height={14} />} onClick={() => setCreating(true)}>
          Nova demanda
        </Button>
      </Box>

      {creating && (
        <Card sx={{ p: 2, mb: 2.5, display: "flex", gap: 1.25, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            autoFocus
            size="small"
            placeholder="Nome da demanda"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && create()}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <TextField select size="small" value={frenteId} onChange={(e) => setFrenteId(e.target.value)} sx={{ minWidth: 140 }}>
            {frentes.map((f) => (
              <MenuItem key={f.id} value={f.id}>
                {f.name}
              </MenuItem>
            ))}
          </TextField>
          <Button onClick={create}>Criar</Button>
          <Button color="inherit" onClick={() => setCreating(false)}>
            Cancelar
          </Button>
        </Card>
      )}

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 1.75 }}>
        {demands.map((d) => (
          <DemandCard key={d.id} demand={d} onClick={() => router.push(`/demandas/${d.id}`)} />
        ))}
      </Box>
    </Box>
  );
}
