"use client";

import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

function isoToday(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function CompletionDateDialog({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: (date: string) => void }) {
  const [custom, setCustom] = useState(isoToday());

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Data da conclusão</DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2 }}>Quando essa tarefa foi concluída?</Typography>
        <Box sx={{ display: "flex", gap: 0.75, mb: 2 }}>
          <Button variant="outlined" color="inherit" fullWidth onClick={() => onConfirm(isoToday())}>
            Hoje
          </Button>
          <Button variant="outlined" color="inherit" fullWidth onClick={() => onConfirm(isoToday(-1))}>
            Ontem
          </Button>
        </Box>
        <Box sx={{ display: "flex", gap: 0.75, alignItems: "center" }}>
          <TextField type="date" size="small" fullWidth value={custom} onChange={(e) => setCustom(e.target.value)} />
          <Button variant="contained" onClick={() => onConfirm(custom)} sx={{ flexShrink: 0 }}>
            Usar essa data
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
