"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Frente, MetaStatus, WLabel } from "@/lib/types";

export interface ConfigLists {
  frentes: Frente[];
  wlabels: WLabel[];
  statusTarefa: MetaStatus[];
  statusDemanda: MetaStatus[];
  pessoas: string[];
}

const Ctx = createContext<ConfigLists | null>(null);

export function ConfigListsProvider({ value, children }: { value: ConfigLists; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useConfigLists() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useConfigLists deve ser usado dentro de ConfigListsProvider");
  return ctx;
}
