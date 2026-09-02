"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export interface Crumb {
  label: string;
  href?: string;
}

interface CrumbState {
  pathname: string;
  crumbs: Crumb[];
}

const Ctx = createContext<{ state: CrumbState | null; setState: (s: CrumbState) => void } | null>(null);

const TOP_LEVEL_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  ciclos: "Ciclos",
  demandas: "Demandas",
  tarefas: "Tarefas",
  analytics: "Analytics",
  aprendizados: "Aprendizados",
  configuracoes: "Configurações",
};

function defaultCrumbs(pathname: string): Crumb[] {
  const first = pathname.split("/").filter(Boolean)[0] || "dashboard";
  return [{ label: TOP_LEVEL_LABELS[first] || first }];
}

export function BreadcrumbsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CrumbState | null>(null);
  return <Ctx.Provider value={{ state, setState }}>{children}</Ctx.Provider>;
}

/** Chame numa página/tela pra registrar a trilha de breadcrumb específica dela. */
export function useBreadcrumbs(items: Crumb[]) {
  const ctx = useContext(Ctx);
  const pathname = usePathname();
  const key = pathname + "|" + JSON.stringify(items);
  useEffect(() => {
    ctx?.setState({ pathname, crumbs: items });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

export function useEffectiveBreadcrumbs(): Crumb[] {
  const ctx = useContext(Ctx);
  const pathname = usePathname();
  return useMemo(() => {
    if (ctx?.state && ctx.state.pathname === pathname) return ctx.state.crumbs;
    return defaultCrumbs(pathname);
  }, [ctx?.state, pathname]);
}
