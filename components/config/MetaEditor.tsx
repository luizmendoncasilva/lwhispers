"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { PURPLE, SWATCHES } from "@/lib/theme";
import type { MetaStatus } from "@/lib/types";

export function MetaEditor({
  items,
  noun,
  onCreate,
  onUpdate,
  onDelete,
}: {
  items: MetaStatus[];
  noun: string;
  onCreate: (data: { nome: string; cor: string; descricao: string }) => Promise<void>;
  onUpdate: (id: string, data: { nome: string; cor: string; descricao: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ nome: "", cor: SWATCHES[0], descricao: "" });

  function refresh() {
    startTransition(() => router.refresh());
  }

  function startAdd() {
    setDraft({ nome: "", cor: SWATCHES[0], descricao: "" });
    setAdding(true);
    setEditingId(null);
  }
  function startEdit(item: MetaStatus) {
    setDraft({ nome: item.name, cor: item.color, descricao: item.description || "" });
    setEditingId(item.id);
    setAdding(false);
  }
  async function save() {
    if (!draft.nome.trim()) return;
    if (editingId) {
      await onUpdate(editingId, draft);
      setEditingId(null);
    } else {
      await onCreate(draft);
      setAdding(false);
    }
    refresh();
  }
  async function remove(id: string) {
    await onDelete(id);
    if (editingId === id) setEditingId(null);
    refresh();
  }

  const isFormOpen = adding || Boolean(editingId);

  return (
    <Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, mb: 1.25 }}>
        {items.map((item) => (
          <Box key={item.id} sx={{ display: "flex", alignItems: "center", gap: 1.1, px: 1.1, py: 0.9, borderRadius: 1.5, border: "1px solid", borderColor: "divider", bgcolor: "background.default" }}>
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: item.color, flexShrink: 0 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 12.5, fontWeight: 500 }}>{item.name}</Typography>
              {item.description && <Typography sx={{ fontSize: 11, color: "text.disabled", mt: 0.15 }}>{item.description}</Typography>}
            </Box>
            <Button size="small" sx={{ fontSize: 11.5, minWidth: 0 }} onClick={() => startEdit(item)}>
              editar
            </Button>
            <IconButton size="small" onClick={() => remove(item.id)}>
              <XMarkIcon width={13} height={13} />
            </IconButton>
          </Box>
        ))}
        {items.length === 0 && <Typography sx={{ fontSize: 12.5, color: "text.disabled" }}>Nada cadastrado ainda.</Typography>}
      </Box>

      {isFormOpen ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, p: 1.25, borderRadius: 1.5, border: "1px solid", borderColor: "divider", bgcolor: "background.default" }}>
          <TextField size="small" autoFocus placeholder={`Nome do ${noun}`} value={draft.nome} onChange={(e) => setDraft({ ...draft, nome: e.target.value })} />
          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
            {SWATCHES.map((c) => (
              <Box
                key={c}
                component="button"
                onClick={() => setDraft({ ...draft, cor: c })}
                sx={{ width: 22, height: 22, borderRadius: "50%", bgcolor: c, border: draft.cor === c ? "2px solid" : "2px solid transparent", borderColor: draft.cor === c ? "text.primary" : "transparent", cursor: "pointer" }}
              />
            ))}
          </Box>
          <TextField size="small" multiline minRows={2} placeholder="Descrição — o que esse item significa" value={draft.descricao} onChange={(e) => setDraft({ ...draft, descricao: e.target.value })} />
          <Box sx={{ display: "flex", gap: 0.75 }}>
            <Button size="small" onClick={save}>
              Salvar
            </Button>
            <Button
              size="small"
              color="inherit"
              onClick={() => {
                setAdding(false);
                setEditingId(null);
              }}
            >
              Cancelar
            </Button>
          </Box>
        </Box>
      ) : (
        <Button size="small" startIcon={<PlusIcon width={13} height={13} />} onClick={startAdd} sx={{ px: 0 }}>
          Novo {noun}
        </Button>
      )}
    </Box>
  );
}

export { PURPLE };
