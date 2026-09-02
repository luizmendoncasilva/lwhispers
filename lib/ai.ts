const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 800 },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const err = new Error(`Gemini respondeu ${res.status}: ${body.slice(0, 300)}`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }

  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") as string | undefined;
  if (!text) throw new Error("Gemini não retornou texto.");
  return text.trim();
}

/**
 * Chama o Gemini com a chave principal; se vier erro de quota/limite (429) ou
 * qualquer outra falha, tenta automaticamente com a chave de fallback.
 */
export async function generateSummary(prompt: string): Promise<string> {
  const primary = process.env.GEMINI_API_KEY_PRIMARY;
  const fallback = process.env.GEMINI_API_KEY_FALLBACK;
  if (!primary && !fallback) throw new Error("Nenhuma GEMINI_API_KEY configurada em .env.local");

  if (primary) {
    try {
      return await callGemini(primary, prompt);
    } catch (err) {
      if (!fallback) throw err;
      console.warn("Gemini (chave principal) falhou, tentando fallback:", (err as Error).message);
    }
  }
  if (!fallback) throw new Error("Chave principal falhou e não há fallback configurado.");
  return callGemini(fallback, prompt);
}
