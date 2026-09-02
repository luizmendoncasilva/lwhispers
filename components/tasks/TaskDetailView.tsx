"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import {
  XMarkIcon,
  PlusIcon,
  PlayIcon,
  PauseIcon,
  ClockIcon,
  UsersIcon,
  PaperClipIcon,
  TagIcon,
  LinkIcon,
  ListBulletIcon,
  DocumentTextIcon,
  Bars3Icon,
  CheckCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
import { BackButton, ColorChip, InitialsAvatar, SectionLabel } from "@/components/ui/Bits";
import { MultiSelect, PeopleMultiSelect, LinksField, FilesField } from "@/components/shared/Selectors";
import { IssuePickerDialog } from "@/components/tasks/IssuePickerDialog";
import { CompletionDateDialog } from "@/components/tasks/CompletionDateDialog";
import { useConfigLists } from "@/components/ConfigListsContext";
import { useAppShell } from "@/components/AppShellContext";
import { useBreadcrumbs } from "@/components/layout/BreadcrumbsContext";
import { fmtDateTime, fmtHM, fmtHMS } from "@/lib/format";
import { SIZES } from "@/lib/mock-issues";
import {
  updateTarefaCampos,
  setTarefaTempoRastreado,
  addSubtarefa,
  toggleSubtarefa,
  removeSubtarefa,
  addAtividade,
  setTarefaPessoas,
  setTarefaLabels,
  addTarefaLink,
  addTarefaArquivo,
  setTarefaIssuesLigadas,
  deleteTarefa,
} from "@/actions/tarefas";
import { removeLink, removeArquivo } from "@/actions/demandas";
import { useToast, runOrToast } from "@/components/shared/ToastContext";
import type { Task } from "@/lib/types";

export function TaskDetailView({ task, demandaId, demandaNome }: { task: Task; demandaId: string; demandaNome: string }) {
  const router = useRouter();
  const { statusTarefa, pessoas, wlabels } = useConfigLists();
  const { timer, now, playTask, pauseTimer, goToIssue } = useAppShell();
  const { showError } = useToast();
  function run<T>(promise: Promise<T>, context?: string) {
    runOrToast(promise, showError, context);
  }
  const [local, setLocal] = useState(task);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [manualH, setManualH] = useState("");
  const [manualM, setManualM] = useState("");
  const [manualS, setManualS] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [comment, setComment] = useState("");
  const [commentTarget, setCommentTarget] = useState("");
  const [pendingStatus, setPendingStatus] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => setLocal(task), [task.id, task]);
  useBreadcrumbs([
    { label: "Demandas", href: "/demandas" },
    { label: demandaNome, href: `/demandas/${demandaId}` },
    { label: local.name },
  ]);

  const subtasks = local.subtasks || [];
  const activity = local.activity || [];
  const isRunning = timer?.taskId === local.id;
  const liveSeconds = isRunning ? Math.floor((now - timer!.startedAt) / 1000) + timer!.baseSeconds : local.trackedSeconds;

  function pushActivity(autor: string, texto: string) {
    setLocal((p) => ({
      ...p,
      activity: [...(p.activity || []), { id: `tmp-${Date.now()}`, author: autor, at: new Date().toISOString(), text: texto }],
    }));
  }

  function addManualTime() {
    const secs = parseInt(manualH || "0", 10) * 3600 + parseInt(manualM || "0", 10) * 60 + parseInt(manualS || "0", 10);
    if (secs > 0) {
      const next = local.trackedSeconds + secs;
      setLocal((p) => ({ ...p, trackedSeconds: next }));
      run(setTarefaTempoRastreado(local.id, next), "tempo rastreado");
    }
    setManualH("");
    setManualM("");
    setManualS("");
  }

  function commitStatus(s: { id: string; name: string }) {
    if (s.name === "Concluído") {
      setPendingStatus(s);
      return;
    }
    const before = local.status;
    setLocal((p) => ({ ...p, status: s.name }));
    if (before !== s.name) pushActivity("Sistema", `Status alterado de "${before}" para "${s.name}".`);
    run(updateTarefaCampos(local.id, { statusId: s.id }), "status");
  }

  function confirmCompletion(date: string) {
    if (!pendingStatus) return;
    const before = local.status;
    setLocal((p) => ({ ...p, status: pendingStatus.name, end: date }));
    if (before !== pendingStatus.name) pushActivity("Sistema", `Status alterado de "${before}" para "${pendingStatus.name}".`);
    pushActivity("Sistema", `Fim alterado para ${date}.`);
    run(updateTarefaCampos(local.id, { statusId: pendingStatus.id, dataFim: date }), "status/data");
    setPendingStatus(null);
  }

  function commitSubtask() {
    const nome = newSubtask.trim();
    if (!nome) return;
    pushActivity("Sistema", `Subtarefa "${nome}" criada.`);
    run(addSubtarefa(local.id, nome), "subtarefa");
    setNewSubtask("");
  }

  function commitComment() {
    const texto = comment.trim();
    if (!texto) return;
    setLocal((p) => ({
      ...p,
      activity: [...(p.activity || []), { id: `tmp-${Date.now()}`, author: "Luiz Mendonça", at: new Date().toISOString(), text: texto, subtaskId: commentTarget || null }],
    }));
    run(addAtividade(local.id, texto, "Luiz Mendonça", commentTarget || null), "comentário");
    setComment("");
  }

  async function handleDelete() {
    setDeleting(true);
    await deleteTarefa(local.id);
    router.push(`/demandas/${demandaId}`);
  }

  return (
    <Box sx={{ px: 3.5, py: 3.25, pb: 7.5, maxWidth: 900 }}>
      <BackButton onClick={() => router.push(`/demandas/${demandaId}`)}>{demandaNome}</BackButton>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 12, color: "text.disabled" }}>T-{local.numero}</Typography>
          <ColorChip color={statusTarefa.find((s) => s.name === local.status)?.color}>{local.status}</ColorChip>
        </Box>
        <Button size="small" color="error" startIcon={<TrashIcon width={13} height={13} />} onClick={() => setConfirmDelete(true)}>
          Excluir tarefa
        </Button>
      </Box>
      <TextField
        variant="standard"
        fullWidth
        value={local.name}
        onChange={(e) => setLocal((p) => ({ ...p, name: e.target.value }))}
        onBlur={() => run(updateTarefaCampos(local.id, { nome: local.name }), "nome")}
        slotProps={{ input: { disableUnderline: true } }}
        sx={{ mb: 2.5, "& input": { fontFamily: "var(--font-space-grotesk)", fontSize: 24, fontWeight: 700 } }}
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.75 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
          <Box>
            <SectionLabel>Início</SectionLabel>
            <TextField
              type="date"
              size="small"
              fullWidth
              value={local.start || ""}
              onChange={(e) => setLocal((p) => ({ ...p, start: e.target.value }))}
              onBlur={() => run(updateTarefaCampos(local.id, { dataInicio: local.start }), "início")}
            />
          </Box>
          <Box>
            <SectionLabel>Fim</SectionLabel>
            <TextField
              type="date"
              size="small"
              fullWidth
              value={local.end || ""}
              onChange={(e) => setLocal((p) => ({ ...p, end: e.target.value }))}
              onBlur={() => run(updateTarefaCampos(local.id, { dataFim: local.end }), "fim")}
            />
          </Box>
          <Box>
            <SectionLabel>Tamanho</SectionLabel>
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {SIZES.map((s) => (
                <ColorChip
                  key={s}
                  color={local.size === s ? "#9614d0" : undefined}
                  outline={local.size !== s}
                  onClick={() => {
                    setLocal((p) => ({ ...p, size: s }));
                    run(updateTarefaCampos(local.id, { tamanho: s }), "tamanho");
                  }}
                >
                  {s}
                </ColorChip>
              ))}
            </Box>
          </Box>
        </Box>

        <Box>
          <SectionLabel icon={Bars3Icon}>Status</SectionLabel>
          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
            {statusTarefa.map((s) => (
              <ColorChip
                key={s.id}
                color={local.status === s.name ? s.color : undefined}
                outline={local.status !== s.name}
                onClick={() => commitStatus(s)}
              >
                {s.name}
              </ColorChip>
            ))}
          </Box>
        </Box>

        <Box>
          <SectionLabel icon={DocumentTextIcon}>Descrição</SectionLabel>
          <TextField
            fullWidth
            multiline
            minRows={3}
            placeholder="Descreva o que precisa ser feito..."
            value={local.description}
            onChange={(e) => setLocal((p) => ({ ...p, description: e.target.value }))}
            onBlur={() => run(updateTarefaCampos(local.id, { descricao: local.description }), "descrição")}
          />
        </Box>

        <Box>
          <SectionLabel icon={ListBulletIcon}>Subtarefas</SectionLabel>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, mb: 1 }}>
            {subtasks.map((s) => (
              <Box
                key={s.id}
                sx={{ display: "flex", alignItems: "center", gap: 1.1, px: 1.25, py: 0.9, borderRadius: 1.5, border: "1px solid", borderColor: "divider", bgcolor: "background.default" }}
              >
                <IconButton
                  size="small"
                  onClick={() => {
                    setLocal((p) => ({ ...p, subtasks: subtasks.map((x) => (x.id === s.id ? { ...x, done: !x.done } : x)) }));
                    pushActivity("Sistema", `Subtarefa "${s.name}" marcada como ${!s.done ? "concluída" : "pendente"}.`);
                    run(toggleSubtarefa(s.id, !s.done), "subtarefa");
                  }}
                  sx={{ p: 0 }}
                >
                  {s.done ? <CheckCircleSolid width={18} height={18} color="#9614d0" /> : <CheckCircleIcon width={18} height={18} />}
                </IconButton>
                <Typography sx={{ fontSize: 13, flex: 1, color: s.done ? "text.disabled" : "text.primary", textDecoration: s.done ? "line-through" : "none" }}>
                  {s.name}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => {
                    setLocal((p) => ({ ...p, subtasks: subtasks.filter((x) => x.id !== s.id) }));
                    run(removeSubtarefa(s.id), "subtarefa");
                  }}
                >
                  <XMarkIcon width={13} height={13} />
                </IconButton>
              </Box>
            ))}
            {subtasks.length === 0 && <Typography sx={{ fontSize: 12.5, color: "text.disabled" }}>Nenhuma subtarefa ainda.</Typography>}
          </Box>
          <Box sx={{ display: "flex", gap: 0.75 }}>
            <TextField size="small" fullWidth placeholder="Nova subtarefa" value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} onKeyDown={(e) => e.key === "Enter" && commitSubtask()} />
            <Button size="small" onClick={commitSubtask}>
              <PlusIcon width={13} height={13} />
            </Button>
          </Box>
        </Box>

        <Box>
          <SectionLabel icon={ClockIcon}>Tempo rastreado</SectionLabel>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
            <Typography sx={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 22, color: isRunning ? "primary.main" : "text.primary", minWidth: 100 }}>
              {isRunning ? fmtHMS(liveSeconds) : fmtHM(liveSeconds)}
            </Typography>
            {isRunning ? (
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<PauseIcon width={13} height={13} />}
                onClick={() => pauseTimer().then((elapsed) => elapsed != null && setLocal((p) => ({ ...p, trackedSeconds: elapsed })))}
              >
                Pausar
              </Button>
            ) : (
              <Button variant="contained" startIcon={<PlayIcon width={13} height={13} />} onClick={() => playTask(local)}>
                Play
              </Button>
            )}
            <Divider orientation="vertical" flexItem />
            <TextField size="small" placeholder="#H" value={manualH} onChange={(e) => setManualH(e.target.value.replace(/\D/g, ""))} sx={{ width: 56 }} />
            <TextField size="small" placeholder="#M" value={manualM} onChange={(e) => setManualM(e.target.value.replace(/\D/g, ""))} sx={{ width: 56 }} />
            <TextField size="small" placeholder="#S" value={manualS} onChange={(e) => setManualS(e.target.value.replace(/\D/g, ""))} sx={{ width: 56 }} />
            <Button size="small" variant="outlined" color="inherit" startIcon={<PlusIcon width={12} height={12} />} onClick={addManualTime}>
              add
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5 }}>
          <Box>
            <SectionLabel icon={UsersIcon}>Pessoas envolvidas</SectionLabel>
            <PeopleMultiSelect
              options={pessoas}
              selected={local.people}
              onChange={(v) => {
                setLocal((p) => ({ ...p, people: v }));
                run(setTarefaPessoas(local.id, v), "pessoas");
              }}
            />
          </Box>
          <Box>
            <SectionLabel icon={PaperClipIcon}>Arquivos relacionados</SectionLabel>
            <FilesField
              files={local.files}
              folder={`tarefas/${local.id}`}
              onAdd={(file) => {
                setLocal((p) => ({ ...p, files: [...p.files, { id: `tmp-${Date.now()}`, name: file.name, url: file.url }] }));
                run(addTarefaArquivo(local.id, file.name, file.url), "arquivo");
              }}
              onRemove={(id) => {
                setLocal((p) => ({ ...p, files: p.files.filter((f) => f.id !== id) }));
                run(removeArquivo(id), "arquivo");
              }}
            />
          </Box>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5 }}>
          <Box>
            <SectionLabel icon={TagIcon}>Labels</SectionLabel>
            <MultiSelect
              options={wlabels.map((w) => w.name)}
              selected={local.labels}
              getColor={(name) => wlabels.find((w) => w.name === name)?.color}
              onChange={(v) => {
                setLocal((p) => ({ ...p, labels: v }));
                run(setTarefaLabels(local.id, v), "labels");
              }}
              placeholder="Buscar label..."
            />
          </Box>
          <Box>
            <SectionLabel icon={LinkIcon}>Links relacionados</SectionLabel>
            <LinksField
              links={local.links}
              onAdd={(nome, url) => {
                setLocal((p) => ({ ...p, links: [...p.links, { id: `tmp-${Date.now()}`, name: nome, url }] }));
                run(addTarefaLink(local.id, nome, url), "link");
              }}
              onRemove={(id) => {
                setLocal((p) => ({ ...p, links: p.links.filter((l) => l.id !== id) }));
                run(removeLink(id), "link");
              }}
            />
          </Box>
        </Box>

        <Box>
          <SectionLabel icon={ListBulletIcon}>Issues relacionadas</SectionLabel>
          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mb: 1 }}>
            {local.relatedIssueIds.map((id) => (
              <ColorChip key={id} color="#9614d0" onClick={() => goToIssue(id)}>
                {id}
              </ColorChip>
            ))}
            {local.relatedIssueIds.length === 0 && <Typography sx={{ fontSize: 12.5, color: "text.disabled" }}>Nenhuma issue vinculada.</Typography>}
          </Box>
          <Button size="small" variant="outlined" color="inherit" onClick={() => setPickerOpen(true)}>
            Selecionar issues do cycle
          </Button>
        </Box>

        <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 2.5 }}>
          <SectionLabel>Atividade</SectionLabel>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 1.75 }}>
            {activity.map((a) => {
              const sub = a.subtaskId ? subtasks.find((s) => s.id === a.subtaskId) : null;
              return (
                <Box key={a.id} sx={{ display: "flex", gap: 1.25 }}>
                  <InitialsAvatar name={a.author} size={24} />
                  <Box>
                    <Typography sx={{ fontSize: 12.5 }}>
                      <strong>{a.author}</strong> <Box component="span" sx={{ color: "text.disabled" }}>{fmtDateTime(a.at)}</Box>
                      {sub && <ColorChip>{sub.name}</ColorChip>}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.4 }}>{a.text}</Typography>
                  </Box>
                </Box>
              );
            })}
            {activity.length === 0 && <Typography sx={{ fontSize: 12.5, color: "text.disabled" }}>Sem atividade ainda.</Typography>}
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {subtasks.length > 0 && (
              <TextField select size="small" value={commentTarget} onChange={(e) => setCommentTarget(e.target.value)} sx={{ alignSelf: "flex-start", minWidth: 220 }}>
                <MenuItem value="">Comentar em: Tarefa principal</MenuItem>
                {subtasks.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    Comentar em: {s.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField fullWidth multiline minRows={2} placeholder="Descreva o que está sendo feito..." value={comment} onChange={(e) => setComment(e.target.value)} />
              <Button onClick={commitComment} sx={{ alignSelf: "flex-end" }}>
                Enviar
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {pickerOpen && (
        <IssuePickerDialog
          alreadySelected={local.relatedIssueIds}
          onClose={() => setPickerOpen(false)}
          onToggle={(id) => {
            const has = local.relatedIssueIds.includes(id);
            const next = has ? local.relatedIssueIds.filter((x) => x !== id) : [...local.relatedIssueIds, id];
            setLocal((p) => ({ ...p, relatedIssueIds: next }));
            run(setTarefaIssuesLigadas(local.id, next), "issues relacionadas");
          }}
        />
      )}

      <CompletionDateDialog open={Boolean(pendingStatus)} onClose={() => setPendingStatus(null)} onConfirm={confirmCompletion} />

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Excluir tarefa?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13.5, color: "text.secondary" }}>
            &quot;{local.name}&quot; e todas as suas subtarefas, atividade, arquivos e links serão apagados. Essa ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setConfirmDelete(false)}>
            Cancelar
          </Button>
          <Button color="error" variant="contained" disabled={deleting} onClick={handleDelete}>
            {deleting ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
