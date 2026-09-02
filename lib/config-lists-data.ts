import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

export const CONFIG_LISTS_TAG = "config-lists";

// Frentes/W.Labels/Status/Pessoas mudam raramente — cache curto evita repetir essas
// 5 queries em toda navegação/refresh do app (o resto dos dados continua sempre fresco).
// actions/config.ts invalida essa tag na hora quando algo muda.
export const getConfigLists = unstable_cache(
  async () => {
    const [frentes, wlabels, statusTarefa, statusDemanda, pessoas] = await Promise.all([
      prisma.frente.findMany({ orderBy: { ordem: "asc" } }),
      prisma.wLabel.findMany({ orderBy: { ordem: "asc" } }),
      prisma.statusTarefa.findMany({ orderBy: { ordem: "asc" } }),
      prisma.statusDemanda.findMany({ orderBy: { ordem: "asc" } }),
      prisma.pessoa.findMany({ orderBy: { ordem: "asc" } }),
    ]);
    return {
      frentes: frentes.map((f) => ({ id: f.id, name: f.nome, color: f.cor, description: f.descricao ?? undefined })),
      wlabels: wlabels.map((w) => ({ id: w.id, name: w.nome, color: w.cor, description: w.descricao ?? undefined })),
      statusTarefa: statusTarefa.map((s) => ({ id: s.id, name: s.nome, color: s.cor, description: s.descricao ?? undefined })),
      statusDemanda: statusDemanda.map((s) => ({ id: s.id, name: s.nome, color: s.cor, description: s.descricao ?? undefined })),
      pessoas: pessoas.map((p) => p.nome),
      pessoasFull: pessoas.map((p) => ({ id: p.id, name: p.nome })),
    };
  },
  ["config-lists"],
  { revalidate: 30, tags: [CONFIG_LISTS_TAG] }
);
