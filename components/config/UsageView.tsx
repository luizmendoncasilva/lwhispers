"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import { SparklesIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { SectionLabel } from "@/components/ui/Bits";
import type { UsageSummary } from "@/lib/usage";

function useCountdown(target: string | null) {
  const [label, setLabel] = useState("—");
  useEffect(() => {
    if (!target) {
      setLabel("—");
      return;
    }
    function tick() {
      const diff = new Date(target as string).getTime() - Date.now();
      if (diff <= 0) {
        setLabel("reiniciando...");
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setLabel(h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return label;
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <Box sx={{ flex: 1, minWidth: 100 }}>
      <Typography sx={{ fontFamily: "var(--font-space-grotesk)", fontSize: 22, fontWeight: 600 }}>{value}</Typography>
      <Typography sx={{ fontSize: 11, color: "text.disabled", mt: 0.25 }}>{label}</Typography>
    </Box>
  );
}

export function UsageView({ usage }: { usage: UsageSummary }) {
  const geminiCountdown = useCountdown(usage.gemini.resetAt);
  const linearCountdown = useCountdown(usage.linear.resetAt);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75, maxWidth: 720 }}>
      <Card sx={{ p: 2.25 }}>
        <SectionLabel icon={SparklesIcon}>Gemini (IA)</SectionLabel>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 1.5 }}>
          <StatBox label="Hoje (UTC)" value={usage.gemini.today} />
          <StatBox label="Últimas 24h" value={usage.gemini.last24h} />
          <StatBox label="Total" value={usage.gemini.total} />
          <StatBox label="Reinicia em" value={geminiCountdown} />
        </Box>
        <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
          O Gemini não informa quota restante via API — a contagem é o que o L.whispers de fato chamou, e o contador de reinício é uma
          estimativa (meia-noite UTC), não o horário real de reset do seu plano.
        </Typography>
      </Card>

      <Card sx={{ p: 2.25 }}>
        <SectionLabel icon={ArrowPathIcon}>Linear</SectionLabel>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 1.5 }}>
          <StatBox label="Hoje (UTC)" value={usage.linear.today} />
          <StatBox label="Últimas 24h" value={usage.linear.last24h} />
          <StatBox label="Total" value={usage.linear.total} />
          <StatBox label="Reinicia em" value={usage.linear.resetAt ? linearCountdown : "—"} />
        </Box>
        {usage.linear.limit != null && usage.linear.remaining != null ? (
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                {usage.linear.remaining} de {usage.linear.limit} requisições restantes na janela atual
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.max(0, Math.min(100, (usage.linear.remaining / usage.linear.limit) * 100))}
              sx={{ height: 6, borderRadius: 999 }}
            />
          </Box>
        ) : (
          <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
            Ainda não recebemos os headers de rate limit do Linear (aparecem depois da primeira sincronização).
          </Typography>
        )}
      </Card>
    </Box>
  );
}
