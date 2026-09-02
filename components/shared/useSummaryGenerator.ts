"use client";

import { useState } from "react";

export function useSummaryGenerator() {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"gemini" | "local" | null>(null);

  async function generate(kind: "daily" | "weekly") {
    setLoading(true);
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });
      const data = await res.json();
      setSummary(data.summary);
      setSource(data.source || null);
    } catch {
      setSummary("Não foi possível gerar o resumo agora — tente novamente em instantes.");
      setSource(null);
    } finally {
      setLoading(false);
    }
  }

  return { summary, loading, source, generate };
}
