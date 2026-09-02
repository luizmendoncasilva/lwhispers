import { prisma } from "@/lib/db";
import { ConfigView } from "@/components/config/ConfigView";

export default async function ConfiguracoesPage() {
  const [frentes, wlabels, statusTarefa, statusDemanda, pessoas] = await Promise.all([
    prisma.frente.findMany({ orderBy: { ordem: "asc" } }),
    prisma.wLabel.findMany({ orderBy: { ordem: "asc" } }),
    prisma.statusTarefa.findMany({ orderBy: { ordem: "asc" } }),
    prisma.statusDemanda.findMany({ orderBy: { ordem: "asc" } }),
    prisma.pessoa.findMany({ orderBy: { ordem: "asc" } }),
  ]);

  return (
    <ConfigView
      frentes={frentes.map((f) => ({ id: f.id, name: f.nome, color: f.cor, description: f.descricao ?? undefined }))}
      wlabels={wlabels.map((w) => ({ id: w.id, name: w.nome, color: w.cor, description: w.descricao ?? undefined }))}
      statusTarefa={statusTarefa.map((s) => ({ id: s.id, name: s.nome, color: s.cor, description: s.descricao ?? undefined }))}
      statusDemanda={statusDemanda.map((s) => ({ id: s.id, name: s.nome, color: s.cor, description: s.descricao ?? undefined }))}
      pessoas={pessoas.map((p) => ({ id: p.id, name: p.nome }))}
    />
  );
}
