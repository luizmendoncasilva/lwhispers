import { prisma } from "@/lib/db";

export async function logApiCall(provider: "gemini" | "linear", action: string, ok: boolean) {
  try {
    await prisma.apiCallLog.create({ data: { provider, action, ok } });
  } catch (err) {
    console.warn("Falha ao registrar uso de API:", (err as Error).message);
  }
}

export async function saveLinearLimitSnapshot(headers: Headers) {
  const limit = headers.get("x-ratelimit-requests-limit");
  const remaining = headers.get("x-ratelimit-requests-remaining");
  const reset = headers.get("x-ratelimit-requests-reset");
  if (!limit && !remaining && !reset) return;
  try {
    await prisma.apiLimitSnapshot.upsert({
      where: { provider: "linear" },
      update: {
        limit: limit ? parseInt(limit, 10) : undefined,
        remaining: remaining ? parseInt(remaining, 10) : undefined,
        resetAt: reset ? new Date(parseInt(reset, 10) * 1000) : undefined,
      },
      create: {
        provider: "linear",
        limit: limit ? parseInt(limit, 10) : null,
        remaining: remaining ? parseInt(remaining, 10) : null,
        resetAt: reset ? new Date(parseInt(reset, 10) * 1000) : null,
      },
    });
  } catch (err) {
    console.warn("Falha ao salvar snapshot de rate limit do Linear:", (err as Error).message);
  }
}

function nextUtcMidnight(): Date {
  const d = new Date();
  d.setUTCHours(24, 0, 0, 0);
  return d;
}

export async function getUsageSummary() {
  const now = new Date();
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [geminiToday, geminiTotal, geminiLast24h, linearToday, linearTotal, linearLast24h, linearSnapshot] = await Promise.all([
    prisma.apiCallLog.count({ where: { provider: "gemini", createdAt: { gte: startOfToday } } }),
    prisma.apiCallLog.count({ where: { provider: "gemini" } }),
    prisma.apiCallLog.count({ where: { provider: "gemini", createdAt: { gte: last24h } } }),
    prisma.apiCallLog.count({ where: { provider: "linear", createdAt: { gte: startOfToday } } }),
    prisma.apiCallLog.count({ where: { provider: "linear" } }),
    prisma.apiCallLog.count({ where: { provider: "linear", createdAt: { gte: last24h } } }),
    prisma.apiLimitSnapshot.findUnique({ where: { provider: "linear" } }),
  ]);

  return {
    gemini: {
      today: geminiToday,
      total: geminiTotal,
      last24h: geminiLast24h,
      resetAt: nextUtcMidnight().toISOString(),
    },
    linear: {
      today: linearToday,
      total: linearTotal,
      last24h: linearLast24h,
      limit: linearSnapshot?.limit ?? null,
      remaining: linearSnapshot?.remaining ?? null,
      resetAt: linearSnapshot?.resetAt?.toISOString() ?? null,
    },
  };
}

export type UsageSummary = Awaited<ReturnType<typeof getUsageSummary>>;
