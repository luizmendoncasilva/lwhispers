"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { listDemandasLite } from "@/actions/demandas";
import { createTarefa } from "@/actions/tarefas";

export function CreateTaskDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [demandas, setDemandas] = useState<{ id: string; name: string }[] | null>(null);
  const [demandaId, setDemandaId] = useState("");
  const [nome, setNome] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setNome("");
    setDemandaId("");
    listDemandasLite().then((d) => {
      setDemandas(d);
      if (d.length > 0) setDemandaId(d[0].id);
    });
  }, [open]);

  async function handleCreate() {
    if (!nome.trim() || !demandaId || creating) return;
    setCreating(true);
    const id = await createTarefa(demandaId, nome.trim());
    setCreating(false);
    onClose();
    router.push(`/demandas/${demandaId}/tarefas/${id}`);
    router.refresh();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Criar tarefa</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1.75, pt: 1 }}>
        <TextField
          autoFocus
          size="small"
          label="Nome da tarefa"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          fullWidth
        />
        {demandas === null ? (
          <Typography sx={{ fontSize: 12.5, color: "text.disabled" }}>Carregando demandas...</Typography>
        ) : demandas.length === 0 ? (
          <Typography sx={{ fontSize: 12.5, color: "text.disabled" }}>
            Nenhuma demanda cadastrada ainda — crie uma demanda primeiro em Demandas.
          </Typography>
        ) : (
          <TextField select size="small" label="Demanda relacionada" value={demandaId} onChange={(e) => setDemandaId(e.target.value)} fullWidth>
            {demandas.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.name}
              </MenuItem>
            ))}
          </TextField>
        )}
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Cancelar
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" disabled={!nome.trim() || !demandaId || creating} onClick={handleCreate}>
          {creating ? "Criando..." : "Criar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
