"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowTopRightOnSquareIcon, UsersIcon, TagIcon, ArrowPathIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { BackButton, ColorChip, InitialsAvatar, SectionLabel } from "@/components/ui/Bits";
import { MarkdownField } from "@/components/shared/MarkdownField";
import { STATUS_DEFS } from "@/lib/mock-issues";
import { ESTIMATE_OPTIONS } from "@/lib/linear";
import { STATUS_ICONS } from "@/components/ciclos/statusIcons";
import { fmtDateTime } from "@/lib/format";
import { useAppShell } from "@/components/AppShellContext";
import { useBreadcrumbs } from "@/components/layout/BreadcrumbsContext";
import { addIssueCommentAction } from "@/actions/linear";
import type { Issue } from "@/lib/types";

export function IssueDetailView({ issueId, onBack }: { issueId: string; onBack: () => void }) {
  const { issues, cycles, updateIssue } = useAppShell();
  const issue = issues.find((i) => i.id === issueId);
  const [local, setLocal] = useState<Issue | undefined>(issue);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => setLocal(issue), [issueId, issue]);

  const cycleForCrumb = cycles.find((c) => c.id === issue?.cycleId);
  useBreadcrumbs([
    { label: "Ciclos", href: "/ciclos" },
    ...(cycleForCrumb ? [{ label: `Cycle ${cycleForCrumb.number}`, href: `/ciclos/${cycleForCrumb.id}` }] : []),
    { label: issueId },
  ]);

  if (!local) return null;
  const current: Issue = local;

  function updateLocal(patch: Partial<Issue>) {
    setLocal((p) => (p ? { ...p, ...patch } : p));
  }
  function commit(patch: Partial<Issue>) {
    const next = { ...current, ...patch };
    setLocal(next);
    updateIssue(next);
  }

  async function addComment() {
    if (!comment.trim() || sending) return;
    setSending(true);
    const next = await addIssueCommentAction(current.id, comment.trim(), "Luiz Mendonça");
    setLocal(next);
    setComment("");
    setSending(false);
  }

  return (
    <Box sx={{ px: 3.5, py: 3.25, pb: 7.5 }}>
      <BackButton onClick={onBack}>Cycle {cycles.find((c) => c.id === local.cycleId)?.number}</BackButton>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.25 }}>
        <Typography sx={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 12, color: "primary.main" }}>{local.id}</Typography>
        <Button variant="outlined" color="inherit" size="small" startIcon={<ArrowTopRightOnSquareIcon width={13} height={13} />} onClick={() => window.open(local.url, "_blank")}>
          Abrir no Linear
        </Button>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 3.75 }}>
        <Box>
          <Typography sx={{ fontFamily: "var(--font-space-grotesk)", fontWeight: 700, fontSize: 22, mb: 2.25 }}>{local.name}</Typography>

          <SectionLabel icon={DocumentTextIcon}>Descrição</SectionLabel>
          <Box sx={{ mb: 3.25 }}>
            <MarkdownField
              value={local.description}
              onChange={(v) => updateLocal({ description: v })}
              onCommit={() => commit({ description: local.description })}
              placeholder="Sem descrição."
            />
          </Box>

          <SectionLabel>Atividade</SectionLabel>
          <Card variant="outlined" sx={{ p: 1.75, mb: 1.75 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {local.activity.map((a) => (
                <Box key={a.id} sx={{ display: "flex", gap: 1.25 }}>
                  <InitialsAvatar name={a.author} size={24} />
                  <Box>
                    <Typography sx={{ fontSize: 12.5 }}>
                      <strong>{a.author}</strong>{" "}
                      <Box component="span" sx={{ color: "text.disabled" }}>
                        {a.type === "created" ? "criou a issue" : "comentou"} · {fmtDateTime(a.at)}
                      </Box>
                    </Typography>
                    {a.text && (
                      <Box
                        sx={{
                          fontSize: 13,
                          color: "text.secondary",
                          mt: 0.4,
                          lineHeight: 1.6,
                          "& p": { m: 0 },
                          "& p + p": { mt: 0.75 },
                        }}
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{a.text}</ReactMarkdown>
                      </Box>
                    )}
                  </Box>
                </Box>
              ))}
              {local.activity.length === 0 && <Typography sx={{ fontSize: 12.5, color: "text.disabled" }}>Sem atividade ainda.</Typography>}
            </Box>
          </Card>

          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField fullWidth multiline minRows={2} placeholder="Deixe uma atualização..." value={comment} onChange={(e) => setComment(e.target.value)} />
            <Button onClick={addComment} disabled={sending} sx={{ alignSelf: "flex-end" }}>
              {sending ? "Enviando..." : "Enviar"}
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
          <Box>
            <SectionLabel>Status</SectionLabel>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {STATUS_DEFS.map((s) => {
                const Icon = STATUS_ICONS[s.key];
                const active = local.status === s.key;
                return (
                  <Box
                    key={s.key}
                    component="button"
                    onClick={() => commit({ status: s.key })}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 1.1,
                      py: 0.9,
                      borderRadius: 1.5,
                      border: "1px solid",
                      borderColor: active ? "primary.main" : "divider",
                      bgcolor: active ? "action.selected" : "transparent",
                      color: active ? "primary.main" : "text.secondary",
                      fontSize: 12.5,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <Icon width={13} height={13} /> {s.label}
                  </Box>
                );
              })}
            </Box>
          </Box>

          <Box>
            <SectionLabel>Prioridade</SectionLabel>
            <ColorChip outline>{local.priority}</ColorChip>
          </Box>

          <Box>
            <SectionLabel icon={UsersIcon}>Assignee</SectionLabel>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.9 }}>
              <InitialsAvatar name="Luiz Mendonça" size={22} />
              <Typography sx={{ fontSize: 12.5 }}>Luiz Mendonça</Typography>
            </Box>
          </Box>

          <Box>
            <SectionLabel>Estimativa</SectionLabel>
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {ESTIMATE_OPTIONS.map((n) => {
                const s = String(n);
                return (
                  <ColorChip key={s} color={local.size === s ? "#9614d0" : undefined} outline={local.size !== s} onClick={() => commit({ size: s })}>
                    {s}
                  </ColorChip>
                );
              })}
            </Box>
          </Box>

          <Box>
            <SectionLabel icon={ArrowPathIcon}>Cycle</SectionLabel>
            <TextField select size="small" fullWidth value={local.cycleId} onChange={(e) => commit({ cycleId: e.target.value })}>
              {cycles.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  Cycle {c.number}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box>
            <SectionLabel icon={TagIcon}>Labels</SectionLabel>
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {local.labels.map((l) => (
                <ColorChip key={l}>{l}</ColorChip>
              ))}
              {local.labels.length === 0 && <Typography sx={{ fontSize: 11.5, color: "text.disabled" }}>—</Typography>}
            </Box>
          </Box>

          <Box>
            <SectionLabel>Projeto</SectionLabel>
            <Typography sx={{ fontSize: 12.5, lineHeight: 1.5 }}>{local.project || "—"}</Typography>
            {local.milestone && <Typography sx={{ fontSize: 11.5, color: "text.disabled", mt: 0.4 }}>{local.milestone}</Typography>}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
