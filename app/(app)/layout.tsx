import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import { getIssuesAndCycles } from "@/lib/issues-data";
import { getConfigLists } from "@/lib/config-lists-data";
import { ConfigListsProvider } from "@/components/ConfigListsContext";
import { AppShellProvider } from "@/components/AppShellContext";
import { BreadcrumbsProvider } from "@/components/layout/BreadcrumbsContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ToastProvider } from "@/components/shared/ToastContext";

// Demandas/tarefas/issues são por usuário/tempo real — nunca prerenderizar.
// (Frentes/W.Labels/Status/Pessoas ficam em cache via getConfigLists, revalidado só quando mudam.)
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const [configLists, { issues, cycles }] = await Promise.all([getConfigLists(), getIssuesAndCycles()]);

  return (
    <ConfigListsProvider value={configLists}>
      <AppShellProvider initialIssues={issues} initialCycles={cycles}>
        <BreadcrumbsProvider>
          <ToastProvider>
            <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
              <Sidebar />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Header />
                <Breadcrumbs />
                <Box component="main">{children}</Box>
              </Box>
            </Box>
          </ToastProvider>
        </BreadcrumbsProvider>
      </AppShellProvider>
    </ConfigListsProvider>
  );
}
