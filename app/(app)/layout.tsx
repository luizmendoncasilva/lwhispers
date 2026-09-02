import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import { prisma } from "@/lib/db";
import { getIssuesAndCycles } from "@/lib/issues-data";
import { ConfigListsProvider } from "@/components/ConfigListsContext";
import { AppShellProvider } from "@/components/AppShellContext";
import { BreadcrumbsProvider } from "@/components/layout/BreadcrumbsContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

// Todo dado aqui é por usuário/tempo real (banco + cache do Linear) — nunca prerenderizar.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const [frentes, wlabels, statusTarefa, statusDemanda, pessoas, { issues, cycles }] = await Promise.all([
    prisma.frente.findMany({ orderBy: { ordem: "asc" } }),
    prisma.wLabel.findMany({ orderBy: { ordem: "asc" } }),
    prisma.statusTarefa.findMany({ orderBy: { ordem: "asc" } }),
    prisma.statusDemanda.findMany({ orderBy: { ordem: "asc" } }),
    prisma.pessoa.findMany({ orderBy: { ordem: "asc" } }),
    getIssuesAndCycles(),
  ]);

  const configLists = {
    frentes: frentes.map((f) => ({ id: f.id, name: f.nome, color: f.cor, description: f.descricao ?? undefined })),
    wlabels: wlabels.map((w) => ({ id: w.id, name: w.nome, color: w.cor, description: w.descricao ?? undefined })),
    statusTarefa: statusTarefa.map((s) => ({ id: s.id, name: s.nome, color: s.cor, description: s.descricao ?? undefined })),
    statusDemanda: statusDemanda.map((s) => ({ id: s.id, name: s.nome, color: s.cor, description: s.descricao ?? undefined })),
    pessoas: pessoas.map((p) => p.nome),
  };

  return (
    <ConfigListsProvider value={configLists}>
      <AppShellProvider initialIssues={issues} initialCycles={cycles}>
        <BreadcrumbsProvider>
          <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
            <Sidebar />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Header />
              <Breadcrumbs />
              <Box component="main">{children}</Box>
            </Box>
          </Box>
        </BreadcrumbsProvider>
      </AppShellProvider>
    </ConfigListsProvider>
  );
}
