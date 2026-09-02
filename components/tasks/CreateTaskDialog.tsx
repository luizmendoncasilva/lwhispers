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
import { SectionLabel, ColorChip } from "@/components/ui/Bits";
import { useConfigLists } from "@/components/ConfigListsContext";
import { listDemandasLite } from "@/actions/demandas";
import { createTarefa } from "@/actions/tarefas";
import { SIZES } from "@/lib/mock-issues";

export function CreateTaskDialog({ open, onClose, fixedDemandaId }: { open: boolean; onClose: () => void; fixedDemandaId?: string }) {
  const router = useRouter();
  const { statusTarefa } = useConfigLists();
  const [demandas, setDemandas] = useState<{ id: string; name: string }[] | null>(null);
  const [demandaId, setDemandaId] = useState(fixedDemandaId || "");
  const [nome, setNome] = useState("");
  const [statusId, setStatusId] = useState("");
  const [tamanho, setTamanho] = useState("S");
  const [inicio, setInicio] = useState(new Date().toISOString().slice(0, 10));
  const [fim, setFim] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setNome("");
    setTamanho("S");
    setInicio(new Date().toISOString().slice(0, 10));
    setFim("");
    setStatusId(statusTarefa[0]?.id || "");
    if (fixedDemandaId) {
      setDemandaId(fixedDemandaId);
      setDemandas(null);
    } else {
      setDemandaId("");
      listDemandasLite().then((d) => {
        setDemandas(d);
        if (d.length > 0) setDemandaId(d[0].id);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, fixedDemandaId]);

  async function handleCreate() {
    if (!nome.trim() || !demandaId || creating) return;
    setCreating(true);
    const id = await createTarefa(demandaId, nome.trim(), {
      statusId: statusId || undefined,
      tamanho,
      dataInicio: inicio || null,
      dataFim: fim || null,
    });
    setCreating(false);
    onClose();
    router.push(`/demandas/${demandaId}/tarefas/${id}`);
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Criar tarefa</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        <TextField
          autoFocus
          size="small"
          label="Nome da tarefa"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          fullWidth
        />

        {!fixedDemandaId &&
          (demandas === null ? (
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
          ))}

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          <TextField type="date" size="small" label="Início" value={inicio} onChange={(e) => setInicio(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
          <TextField type="date" size="small" label="Fim" value={fim} onChange={(e) => setFim(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
        </Box>

        <Box>
          <SectionLabel>Tamanho</SectionLabel>
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {SIZES.map((s) => (
              <ColorChip key={s} color={tamanho === s ? "#9614d0" : undefined} outline={tamanho !== s} onClick={() => setTamanho(s)}>
                {s}
              </ColorChip>
            ))}
          </Box>
        </Box>

        <Box>
          <SectionLabel>Status</SectionLabel>
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {statusTarefa.map((s) => (
              <ColorChip key={s.id} color={statusId === s.id ? s.color : undefined} outline={statusId !== s.id} onClick={() => setStatusId(s.id)}>
                {s.name}
              </ColorChip>
            ))}
          </Box>
        </Box>
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
