import { prisma } from "@/lib/db";
import { getCachedIssuesAndCycles, syncActiveData } from "@/lib/linear";
import type { Cycle, Issue } from "@/lib/types";

/** Lê o cache local; se estiver vazio (primeira vez rodando), sincroniza com o Linear antes de ler. */
export async function getIssuesAndCycles(): Promise<{ issues: Issue[]; cycles: Cycle[] }> {
  const cacheCount = await prisma.issueCache.count();
  if (cacheCount === 0) {
    try {
      await syncActiveData();
    } catch {
      return { issues: [], cycles: [] };
    }
  }
  return getCachedIssuesAndCycles();
}
