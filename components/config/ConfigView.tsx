"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { TagIcon, ListBulletIcon, RectangleStackIcon, UsersIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { SectionLabel } from "@/components/ui/Bits";
import { MetaEditor } from "@/components/config/MetaEditor";
import {
  createFrente,
  updateFrente,
  deleteFrente,
  createWLabel,
  updateWLabel,
  deleteWLabel,
  createStatusTarefa,
  updateStatusTarefa,
  deleteStatusTarefa,
  createStatusDemanda,
  updateStatusDemanda,
  deleteStatusDemanda,
  createPessoa,
  deletePessoa,
} from "@/actions/config";
import type { MetaStatus } from "@/lib/types";

function ConfigSection({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ width?: number; height?: number }>; children: React.ReactNode }) {
  return (
    <Card sx={{ p: 2.25 }}>
      <SectionLabel icon={Icon}>{title}</SectionLabel>
      {children}
    </Card>
  );
}

function PessoasSection({ pessoas }: { pessoas: { id: string; name: string }[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [val, setVal] = useState("");
  function refresh() {
    startTransition(() => router.refresh());
  }
  return (
    <ConfigSection title="Pessoas" icon={UsersIcon}>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {pessoas.map((p) => (
          <Box
            key={p.id}
            sx={{ display: "flex", alignItems: "center", gap: 0.75, pl: 1.25, pr: 0.75, py: 0.5, borderRadius: 999, border: "1px solid", borderColor: "divider", bgcolor: "background.default" }}
          >
            <Typography sx={{ fontSize: 12.5 }}>{p.name}</Typography>
            <Box
              component="button"
              onClick={() => deletePessoa(p.id).then(refresh)}
              sx={{ background: "none", border: "none", color: "text.disabled", cursor: "pointer", display: "flex" }}
            >
              <XMarkIcon width={11} height={11} />
            </Box>
          </Box>
        ))}
        {pessoas.length === 0 && <Typography sx={{ fontSize: 12.5, color: "text.disabled" }}>Nada cadastrado ainda.</Typography>}
      </Box>
      <Box sx={{ display: "flex", gap: 0.75, mt: 1.5 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Nome da pessoa"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && val.trim()) {
              createPessoa(val.trim()).then(refresh);
              setVal("");
            }
          }}
        />
        <Button
          size="small"
          onClick={() => {
            if (val.trim()) {
              createPessoa(val.trim()).then(refresh);
              setVal("");
            }
          }}
        >
          <PlusIcon width={13} height={13} />
        </Button>
      </Box>
    </ConfigSection>
  );
}

export function ConfigView({
  frentes,
  wlabels,
  statusTarefa,
  statusDemanda,
  pessoas,
}: {
  frentes: MetaStatus[];
  wlabels: MetaStatus[];
  statusTarefa: MetaStatus[];
  statusDemanda: MetaStatus[];
  pessoas: { id: string; name: string }[];
}) {
  return (
    <Box sx={{ px: 3.5, py: 3.25, pb: 7.5 }}>
      <Typography sx={{ fontSize: 12, color: "text.disabled", maxWidth: 640, mb: 2.5, lineHeight: 1.5 }}>
        Cada frente, W.Label e status tem uma cor e uma descrição — usadas em todo o app. Excluir um item aqui não remove o vínculo já existente em
        demandas/tarefas que o usam.
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.75, maxWidth: 980 }}>
        <ConfigSection title="Frentes (labels de demanda)" icon={TagIcon}>
          <MetaEditor
            items={frentes}
            noun="frente"
            onCreate={(d) => createFrente({ nome: d.nome, cor: d.cor, descricao: d.descricao })}
            onUpdate={(id, d) => updateFrente(id, { nome: d.nome, cor: d.cor, descricao: d.descricao })}
            onDelete={deleteFrente}
          />
        </ConfigSection>
        <ConfigSection title="W.Labels" icon={TagIcon}>
          <MetaEditor
            items={wlabels}
            noun="W.Label"
            onCreate={(d) => createWLabel({ nome: d.nome, cor: d.cor, descricao: d.descricao })}
            onUpdate={(id, d) => updateWLabel(id, { nome: d.nome, cor: d.cor, descricao: d.descricao })}
            onDelete={deleteWLabel}
          />
        </ConfigSection>
        <ConfigSection title="Status das tarefas" icon={ListBulletIcon}>
          <MetaEditor
            items={statusTarefa}
            noun="status"
            onCreate={(d) => createStatusTarefa({ nome: d.nome, cor: d.cor, descricao: d.descricao })}
            onUpdate={(id, d) => updateStatusTarefa(id, { nome: d.nome, cor: d.cor, descricao: d.descricao })}
            onDelete={deleteStatusTarefa}
          />
        </ConfigSection>
        <ConfigSection title="Status das demandas" icon={RectangleStackIcon}>
          <MetaEditor
            items={statusDemanda}
            noun="status"
            onCreate={(d) => createStatusDemanda({ nome: d.nome, cor: d.cor, descricao: d.descricao })}
            onUpdate={(id, d) => updateStatusDemanda(id, { nome: d.nome, cor: d.cor, descricao: d.descricao })}
            onDelete={deleteStatusDemanda}
          />
        </ConfigSection>
        <PessoasSection pessoas={pessoas} />
      </Box>
    </Box>
  );
}
