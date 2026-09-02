"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import {
  Squares2X2Icon,
  ListBulletIcon,
  PlusIcon,
  ClockIcon,
  UsersIcon,
  PaperClipIcon,
  LinkIcon,
  TagIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { BackButton, ColorChip, IconBtn, SectionLabel } from "@/components/ui/Bits";
import { PeopleMultiSelect, MultiSelect, LinksField, FilesField } from "@/components/shared/Selectors";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskTable } from "@/components/tasks/TaskTable";
import { useConfigLists } from "@/components/ConfigListsContext";
import { useAppShell } from "@/components/AppShellContext";
import { useBreadcrumbs } from "@/components/layout/BreadcrumbsContext";
import { STATUS_DEFS } from "@/lib/mock-issues";
import { SKILLS } from "@/lib/skills";
import { fmtDateTime } from "@/lib/format";
import {
  updateDemandaCampos,
  setDemandaPessoas,
  setDemandaWLabels,
  addDemandaLink,
  addDemandaArquivo,
  addDemandaDecisao,
  markStakeholderUpdate,
  setDemandaBlockedBy,
  setDemandaBlocks,
  deleteDemanda,
} from "@/actions/demandas";
import { removeLink, removeArquivo } from "@/actions/demandas";
import { createTarefa } from "@/actions/tarefas";
import type { Demand, Task } from "@/lib/types";

const SKILLS_LIST = SKILLS;

export function DemandFullPage({ demand, allDemands }: { demand: Demand; allDemands: { id: string; name: string }[] }) {
  const router = useRouter();
  const { frentes, statusDemanda, pessoas, wlabels } = useConfigLists();
  const { issues, openTask } = useAppShell();
  const [local, setLocal] = useState(demand);
  const [view, setView] = useState<"kanban" | "lista">("kanban");
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newDecision, setNewDecision] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [, startTransition] = useTransition();

  useBreadcrumbs([{ label: "Demandas", href: "/demandas" }, { label: local.name }]);
  useEffect(() => setLocal(demand), [demand]);

  async function handleDeleteDemanda() {
    setDeleting(true);
    await deleteDemanda(local.id);
    router.push("/demandas");
  }

  function refresh() {
    startTransition(() => router.refresh());
  }

  const frente = frentes.find((f) => f.id === local.frenteId)!;
  const statusCounts = STATUS_DEFS.map((def) => ({
    def,
    count: local.relatedIssueIds.map((id) => issues.find((i) => i.id === id)).filter((i) => i && i.status === def.key).length,
  })).filter((s) => s.count > 0);
  const decisions = local.decisions || [];
  const otherDemands = allDemands.filter((d) => d.id !== local.id);
  const demandName = (id: string) => allDemands.find((d) => d.id === id)?.name || id;

  function taskStatuses() {
    return Array.from(new Set(local.tasks.map((t) => t.status)));
  }

  async function addTask() {
    if (!newTaskName.trim()) return;
    const id = await createTarefa(local.id, newTaskName.trim());
    setNewTaskName("");
    setAddingTask(false);
    refresh();
  }

  return (
    <Box sx={{ px: 3.5, py: 3.25, pb: 7.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <BackButton onClick={() => router.push("/demandas")}>Demandas</BackButton>
        <Button size="small" color="error" startIcon={<TrashIcon width={13} height={13} />} onClick={() => setConfirmDelete(true)}>
          Excluir demanda
        </Button>
      </Box>

      <Box sx={{ mb: 2.75 }}>
        <ColorChip color={frente.color}>{frente.name}</ColorChip>
        <TextField
          variant="standard"
          fullWidth
          value={local.name}
          onChange={(e) => setLocal((p) => ({ ...p, name: e.target.value }))}
          onBlur={() => updateDemandaCampos(local.id, { nome: local.name }).then(refresh)}
          slotProps={{ input: { disableUnderline: true } }}
          sx={{ display: "block", my: 1.25, "& input": { fontFamily: "var(--font-space-grotesk)", fontSize: 24, fontWeight: 700 } }}
        />
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 1.5 }}>
          {statusCounts.map(({ def, count }) => (
            <ColorChip key={def.key}>
              {count} {def.label.toLowerCase()}
            </ColorChip>
          ))}
          {statusCounts.length === 0 && <Typography sx={{ fontSize: 12, color: "text.disabled" }}>Sem issues vinculadas ainda.</Typography>}
        </Box>
        <SectionLabel>Status da demanda</SectionLabel>
        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
          {statusDemanda.map((s) => (
            <ColorChip
              key={s.id}
              color={local.status === s.name ? s.color : undefined}
              outline={local.status !== s.name}
              onClick={() => {
                setLocal((p) => ({ ...p, status: s.name }));
                updateDemandaCampos(local.id, { statusId: s.id }).then(refresh);
              }}
            >
              {s.name}
            </ColorChip>
          ))}
        </Box>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.75, mb: 2.75 }}>
        <Box>
          <SectionLabel>Início — fim</SectionLabel>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              type="date"
              size="small"
              fullWidth
              value={local.start || ""}
              onChange={(e) => setLocal((p) => ({ ...p, start: e.target.value }))}
              onBlur={() => updateDemandaCampos(local.id, { dataInicio: local.start }).then(refresh)}
            />
            <TextField
              type="date"
              size="small"
              fullWidth
              value={local.end || ""}
              onChange={(e) => setLocal((p) => ({ ...p, end: e.target.value }))}
              onBlur={() => updateDemandaCampos(local.id, { dataFim: local.end || null }).then(refresh)}
            />
          </Box>
        </Box>
        <Box>
          <SectionLabel icon={ClockIcon}>Tempo rastreado</SectionLabel>
          <Typography sx={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 15, pt: 0.75 }}>
            {local.tasks.reduce((a, t) => a + t.trackedSeconds, 0) > 0
              ? Math.round(local.tasks.reduce((a, t) => a + t.trackedSeconds, 0) / 3600) + "h"
              : "0h"}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mb: 2.75 }}>
        <SectionLabel>Repositório relacionado</SectionLabel>
        <TextField
          fullWidth
          size="small"
          placeholder="https://github.com/org/repo"
          value={local.repo}
          onChange={(e) => setLocal((p) => ({ ...p, repo: e.target.value }))}
          onBlur={() => updateDemandaCampos(local.id, { repositorio: local.repo }).then(refresh)}
        />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.75, mb: 2.75 }}>
        <Box>
          <SectionLabel icon={PaperClipIcon}>Arquivos relacionados</SectionLabel>
          <FilesField
            files={local.files}
            onAdd={(nome) => {
              setLocal((p) => ({ ...p, files: [...p.files, { id: `tmp-${Date.now()}`, name: nome }] }));
              addDemandaArquivo(local.id, nome).then(refresh);
            }}
            onRemove={(id) => {
              setLocal((p) => ({ ...p, files: p.files.filter((f) => f.id !== id) }));
              removeArquivo(id).then(refresh);
            }}
          />
        </Box>
        <Box>
          <SectionLabel icon={UsersIcon}>Pessoas interessadas</SectionLabel>
          <PeopleMultiSelect
            options={pessoas}
            selected={local.people}
            onChange={(v) => {
              setLocal((p) => ({ ...p, people: v }));
              setDemandaPessoas(local.id, v).then(refresh);
            }}
          />
          {local.people.length > 0 && (
            <Box sx={{ mt: 1.25, display: "flex", flexDirection: "column", gap: 0.6 }}>
              {local.people.map((p) => {
                const upd = (local.stakeholderUpdates || []).find((s) => s.person === p);
                return (
                  <Box key={p} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                    <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                      {p} — última atualização: <Box component="span" sx={{ color: "text.disabled" }}>{upd ? upd.lastSentAt : "nunca"}</Box>
                    </Typography>
                    <Button
                      size="small"
                      sx={{ fontSize: 11.5, p: 0, minWidth: 0 }}
                      onClick={() => {
                        markStakeholderUpdate(local.id, p).then(refresh);
                      }}
                    >
                      marcar hoje
                    </Button>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ mb: 2.75 }}>
        <SectionLabel icon={LinkIcon}>Links relacionados</SectionLabel>
        <LinksField
          links={local.links}
          onAdd={(nome, url) => {
            setLocal((p) => ({ ...p, links: [...p.links, { id: `tmp-${Date.now()}`, name: nome, url }] }));
            addDemandaLink(local.id, nome, url).then(refresh);
          }}
          onRemove={(id) => {
            setLocal((p) => ({ ...p, links: p.links.filter((l) => l.id !== id) }));
            removeLink(id).then(refresh);
          }}
        />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.75, mb: 2.75 }}>
        <Box>
          <SectionLabel icon={TagIcon}>W.Labels</SectionLabel>
          <MultiSelect
            options={wlabels.map((w) => w.id)}
            selected={local.wlabels}
            getColor={(id) => wlabels.find((w) => w.id === id)?.color}
            getLabel={(id) => wlabels.find((w) => w.id === id)?.name || id}
            onChange={(v) => {
              setLocal((p) => ({ ...p, wlabels: v }));
              setDemandaWLabels(local.id, v).then(refresh);
            }}
            placeholder="Buscar W.Label..."
          />
        </Box>
        <Box>
          <SectionLabel icon={AcademicCapIcon}>Skills praticados</SectionLabel>
          <MultiSelect
            options={SKILLS_LIST}
            selected={local.skills || []}
            onChange={(v) => {
              setLocal((p) => ({ ...p, skills: v }));
              updateDemandaCampos(local.id, { skills: v }).then(refresh);
            }}
            placeholder="Buscar skill..."
          />
        </Box>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.75, mb: 2.75 }}>
        <Box>
          <SectionLabel icon={ExclamationTriangleIcon}>Bloqueada por</SectionLabel>
          <MultiSelect
            options={otherDemands.map((d) => d.id)}
            selected={local.blockedBy || []}
            getLabel={demandName}
            onChange={(v) => {
              setLocal((p) => ({ ...p, blockedBy: v }));
              setDemandaBlockedBy(local.id, v).then(refresh);
            }}
            placeholder="Buscar demanda..."
          />
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
            {(local.blockedBy || []).map((id) => (
              <ColorChip key={id}>{demandName(id)}</ColorChip>
            ))}
          </Box>
        </Box>
        <Box>
          <SectionLabel icon={ExclamationTriangleIcon}>Bloqueia</SectionLabel>
          <MultiSelect
            options={otherDemands.map((d) => d.id)}
            selected={local.blocks || []}
            getLabel={demandName}
            onChange={(v) => {
              setLocal((p) => ({ ...p, blocks: v }));
              setDemandaBlocks(local.id, v).then(refresh);
            }}
            placeholder="Buscar demanda..."
          />
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
            {(local.blocks || []).map((id) => (
              <ColorChip key={id}>{demandName(id)}</ColorChip>
            ))}
          </Box>
        </Box>
      </Box>

      <Box sx={{ mb: 2.75 }}>
        <SectionLabel icon={DocumentTextIcon}>Decisões</SectionLabel>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 1 }}>
          {decisions.map((d) => (
            <Box key={d.id} sx={{ px: 1.25, py: 0.9, borderRadius: 1.5, border: "1px solid", borderColor: "divider", bgcolor: "background.default" }}>
              <Typography sx={{ fontSize: 13, lineHeight: 1.5 }}>{d.text}</Typography>
              <Typography sx={{ fontSize: 10.5, color: "text.disabled", mt: 0.4 }}>
                {d.author} · {fmtDateTime(d.at)}
              </Typography>
            </Box>
          ))}
          {decisions.length === 0 && <Typography sx={{ fontSize: 12.5, color: "text.disabled" }}>Nenhuma decisão registrada ainda.</Typography>}
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            multiline
            minRows={2}
            placeholder="Registrar uma decisão tomada nesta demanda..."
            value={newDecision}
            onChange={(e) => setNewDecision(e.target.value)}
          />
          <Button
            sx={{ alignSelf: "flex-end" }}
            onClick={() => {
              if (!newDecision.trim()) return;
              addDemandaDecisao(local.id, newDecision.trim(), "Luiz Mendonça").then(refresh);
              setNewDecision("");
            }}
          >
            Registrar
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 3.75 }}>
        <SectionLabel icon={DocumentTextIcon}>Observações</SectionLabel>
        <TextField
          fullWidth
          multiline
          minRows={3}
          placeholder="Anotações livres sobre a demanda..."
          value={local.observations}
          onChange={(e) => setLocal((p) => ({ ...p, observations: e.target.value }))}
          onBlur={() => updateDemandaCampos(local.id, { observacoes: local.observations }).then(refresh)}
        />
      </Box>

      <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 2.75 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.75 }}>
          <Typography sx={{ fontFamily: "var(--font-space-grotesk)", fontWeight: 600, fontSize: 14.5 }}>Tarefas</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <IconBtn active={view === "kanban"} onClick={() => setView("kanban")}>
              <Squares2X2Icon width={14} height={14} />
            </IconBtn>
            <IconBtn active={view === "lista"} onClick={() => setView("lista")}>
              <ListBulletIcon width={14} height={14} />
            </IconBtn>
            <Button size="small" startIcon={<PlusIcon width={13} height={13} />} onClick={() => setAddingTask(true)}>
              Tarefa
            </Button>
          </Box>
        </Box>

        {addingTask && (
          <Box sx={{ display: "flex", gap: 0.75, mb: 1.75 }}>
            <TextField
              autoFocus
              size="small"
              fullWidth
              placeholder="Nome da tarefa"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
            <Button size="small" onClick={addTask}>
              Criar
            </Button>
            <Button size="small" color="inherit" onClick={() => setAddingTask(false)}>
              Cancelar
            </Button>
          </Box>
        )}

        {view === "kanban" ? (
          <Box sx={{ display: "flex", gap: 1.5, overflowX: "auto", pb: 0.75 }}>
            {["Backlog", "Em andamento", "Bloqueado", "Revisão", "Concluído"].map((status) => (
              <Box key={status} sx={{ minWidth: 220, flex: "1 0 220px" }}>
                <Typography sx={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 10.5, color: "text.disabled", mb: 1, letterSpacing: 0.3 }}>
                  {status.toUpperCase()} · {local.tasks.filter((tk) => tk.status === status).length}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {local.tasks
                    .filter((tk) => tk.status === status)
                    .map((tk) => (
                      <TaskCard key={tk.id} task={tk} onClick={() => openTask(tk)} />
                    ))}
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <TaskTable tasks={local.tasks} showStatus onOpenTask={openTask} />
        )}
      </Box>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Excluir demanda?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13.5, color: "text.secondary" }}>
            &quot;{local.name}&quot; e todas as suas {local.tasks.length} tarefa(s) serão apagadas. Essa ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setConfirmDelete(false)}>
            Cancelar
          </Button>
          <Button color="error" variant="contained" disabled={deleting} onClick={handleDeleteDemanda}>
            {deleting ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
