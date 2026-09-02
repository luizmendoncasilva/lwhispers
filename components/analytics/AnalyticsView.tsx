"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { ChartBarIcon, ExclamationTriangleIcon, RectangleStackIcon, DocumentTextIcon, SparklesIcon, ShareIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { SectionLabel } from "@/components/ui/Bits";
import { useConfigLists } from "@/components/ConfigListsContext";
import { fmtDate, fmtDateTime, fmtHM, weekRange } from "@/lib/format";
import { TODAY } from "@/lib/summary";
import { useSummaryGenerator } from "@/components/shared/useSummaryGenerator";
import type { Demand } from "@/lib/types";

function MiniBarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1.25, height: 120, px: 0.5 }}>
      {data.map((d) => (
        <Box key={d.label} sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75 }}>
          <Typography sx={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 10, color: "text.disabled" }}>{d.value > 0 ? fmtHM(d.value) : ""}</Typography>
          <Box sx={{ width: "100%", height: 90, display: "flex", alignItems: "flex-end", bgcolor: "background.default", borderRadius: 1, overflow: "hidden" }}>
            <Box sx={{ width: "100%", height: `${(d.value / max) * 100}%`, bgcolor: "primary.main", borderRadius: "6px 6px 0 0" }} />
          </Box>
          <Typography sx={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 10, color: "text.disabled" }}>{d.label}</Typography>
        </Box>
      ))}
    </Box>
  );
}

export function AnalyticsView({ demands }: { demands: Demand[] }) {
  const { summary: weeklySummary, loading, source, generate } = useSummaryGenerator();
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const { start: weekStart, end: weekEnd } = weekRange(new Date(TODAY + "T00:00:00"));
  const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const loadByDay = weekDays.map((label, idx) => {
    const value = demands
      .flatMap((d) => d.tasks)
      .filter((tk) => tk.start && tk.start >= weekStart && tk.start <= weekEnd && new Date(tk.start + "T00:00:00").getDay() === (idx === 6 ? 0 : idx + 1))
      .reduce((a, tk) => a + (tk.trackedSeconds || 0), 0);
    return { label, value };
  });

  const blockedDemands = demands.filter((d) => (d.blockedBy || []).length > 0);
  const demandName = (id: string) => demands.find((x) => x.id === id)?.name || id;

  const activeDemands = demands.filter((d) => d.status !== "Concluída");
  const allStarts = activeDemands.map((d) => new Date(d.start).getTime());
  const allEnds = activeDemands.map((d) => new Date(d.end || TODAY).getTime());
  const rangeStart = Math.min(...allStarts, new Date(TODAY).getTime());
  const rangeEnd = Math.max(...allEnds, new Date(TODAY).getTime());
  const rangeSpan = Math.max(1, rangeEnd - rangeStart);

  const { frentes } = useConfigLists();
  const allDecisions = demands
    .flatMap((d) => (d.decisions || []).map((dec) => ({ ...dec, demandName: d.name })))
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return (
    <Box sx={{ px: 3.5, py: 3.25, pb: 7.5, display: "flex", flexDirection: "column", gap: 3.75 }}>
      <Box>
        <SectionLabel icon={ChartBarIcon}>Carga de trabalho na semana</SectionLabel>
        <Card sx={{ p: 2.25 }}>
          <MiniBarChart data={loadByDay} />
          <Typography sx={{ fontSize: 11, color: "text.disabled", mt: 1.25 }}>
            Tempo rastreado, agrupado pelo dia de início das tarefas da semana de {fmtDate(weekStart)} a {fmtDate(weekEnd)}.
          </Typography>
        </Card>
      </Box>

      <Box>
        <SectionLabel icon={ExclamationTriangleIcon}>Dependências entre demandas</SectionLabel>
        <Card sx={{ p: 2.25 }}>
          {blockedDemands.length === 0 ? (
            <Typography sx={{ fontSize: 12.5, color: "text.disabled" }}>Nenhuma demanda com dependência bloqueante registrada.</Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {blockedDemands.map((d) => (
                <Typography key={d.id} sx={{ fontSize: 13 }}>
                  <strong>{d.name}</strong>
                  <Box component="span" sx={{ color: "text.disabled" }}>
                    {" "}
                    está bloqueada por:{" "}
                  </Box>
                  {(d.blockedBy || []).map(demandName).join(", ")}
                </Typography>
              ))}
            </Box>
          )}
        </Card>
      </Box>

      <Box>
        <SectionLabel icon={RectangleStackIcon}>Linha do tempo das demandas ativas</SectionLabel>
        <Card sx={{ p: 2.25 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {activeDemands.map((d) => {
              const frente = frentes.find((f) => f.id === d.frenteId);
              const s = new Date(d.start).getTime();
              const e = new Date(d.end || TODAY).getTime();
              const left = ((s - rangeStart) / rangeSpan) * 100;
              const width = Math.max(2, ((e - s) / rangeSpan) * 100);
              return (
                <Box key={d.id}>
                  <Typography sx={{ fontSize: 11.5, color: "text.secondary", mb: 0.4 }}>{d.name}</Typography>
                  <Box sx={{ position: "relative", height: 10, bgcolor: "background.default", borderRadius: 999 }}>
                    <Box sx={{ position: "absolute", left: `${left}%`, width: `${width}%`, height: "100%", bgcolor: frente?.color || "primary.main", borderRadius: 999 }} />
                  </Box>
                </Box>
              );
            })}
            {activeDemands.length === 0 && <Typography sx={{ fontSize: 12.5, color: "text.disabled" }}>Nenhuma demanda ativa.</Typography>}
          </Box>
        </Card>
      </Box>

      <Box>
        <SectionLabel icon={DocumentTextIcon}>Log de decisões</SectionLabel>
        <Card sx={{ p: 2.25 }}>
          {allDecisions.length === 0 ? (
            <Typography sx={{ fontSize: 12.5, color: "text.disabled" }}>Nenhuma decisão registrada em nenhuma demanda ainda.</Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
              {allDecisions.map((d) => (
                <Box key={d.id} sx={{ pb: 1.25, borderBottom: "1px solid", borderColor: "divider" }}>
                  <Typography sx={{ fontSize: 13 }}>{d.text}</Typography>
                  <Typography sx={{ fontSize: 10.5, color: "text.disabled", mt: 0.4 }}>
                    {d.demandName} · {fmtDateTime(d.at)}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Card>
      </Box>

      <Box>
        <SectionLabel icon={SparklesIcon}>Resumo semanal</SectionLabel>
        <Card sx={{ p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button size="small" startIcon={<SparklesIcon width={13} height={13} />} disabled={loading} onClick={() => generate("weekly")}>
              {loading ? "Gerando..." : "Gerar resumo semanal"}
            </Button>
          </Box>
          {weeklySummary && (
            <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.75, mb: 0.75 }}>
                <Button
                  size="small"
                  color="inherit"
                  startIcon={<ClipboardDocumentIcon width={12} height={12} />}
                  onClick={() => {
                    navigator.clipboard?.writeText(weeklySummary);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  {copied ? "Copiado!" : "Copiar texto"}
                </Button>
              </Box>
              <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.6, whiteSpace: "pre-line" }}>{weeklySummary}</Typography>
              <Typography sx={{ mt: 1, fontSize: 10.5, fontFamily: "var(--font-jetbrains-mono)", color: "text.disabled" }}>
                {source === "gemini" ? "gerado via Gemini" : "gerado localmente (IA indisponível no momento)"}
              </Typography>

              <Box sx={{ mt: 1.75, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
                <SectionLabel icon={ShareIcon}>Compartilhar por link</SectionLabel>
                {!shareLink ? (
                  <Button size="small" variant="outlined" color="inherit" startIcon={<ShareIcon width={13} height={13} />} onClick={() => setShareLink(`https://lwhispers.app/share/resumo/${Date.now()}`)}>
                    Gerar link de compartilhamento
                  </Button>
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField
                      size="small"
                      fullWidth
                      value={shareLink}
                      slotProps={{ input: { readOnly: true, sx: { fontFamily: "var(--font-jetbrains-mono)", fontSize: 11.5 } } }}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      color="inherit"
                      startIcon={<ClipboardDocumentIcon width={12} height={12} />}
                      onClick={() => {
                        navigator.clipboard?.writeText(shareLink);
                        setLinkCopied(true);
                        setTimeout(() => setLinkCopied(false), 1500);
                      }}
                    >
                      {linkCopied ? "Copiado!" : "Copiar"}
                    </Button>
                  </Box>
                )}
                <Typography sx={{ fontSize: 10.5, color: "text.disabled", mt: 0.75 }}>
                  Link simulado — em produção apontaria pra uma página pública somente-leitura com esse resumo.
                </Typography>
              </Box>
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
}
