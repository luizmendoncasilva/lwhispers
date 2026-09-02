"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { setTarefaTempoRastreado } from "@/actions/tarefas";
import { updateIssueAction } from "@/actions/linear";
import type { Cycle, Issue, Task, Timer } from "@/lib/types";

interface AppShellValue {
  issues: Issue[];
  cycles: Cycle[];
  currentCycle: Cycle | null;
  updateIssue: (next: Issue) => void;
  timer: Timer | null;
  now: number;
  playTask: (task: Task) => void;
  pauseTimer: () => Promise<number | null>;
  /** Navega pra tela da tarefa (rota própria: /demandas/[demandaId]/tarefas/[taskId]). */
  openTask: (task: Task) => void;
  goToIssue: (issueId: string) => void;
}

const AppShellCtx = createContext<AppShellValue | null>(null);

export function useAppShell() {
  const ctx = useContext(AppShellCtx);
  if (!ctx) throw new Error("useAppShell deve ser usado dentro de AppShellProvider");
  return ctx;
}

export function AppShellProvider({
  initialIssues,
  initialCycles,
  children,
}: {
  initialIssues: Issue[];
  initialCycles: Cycle[];
  children: ReactNode;
}) {
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const [cycles] = useState<Cycle[]>(initialCycles);
  const [timer, setTimer] = useState<Timer | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => setIssues(initialIssues), [initialIssues]);

  useEffect(() => {
    if (!timer) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const currentCycle = useMemo(() => cycles.find((c) => c.current) || cycles[cycles.length - 1] || null, [cycles]);

  const updateIssue = useCallback(
    (next: Issue) => {
      const prevIssue = issues.find((i) => i.id === next.id);
      setIssues((prev) => prev.map((i) => (i.id === next.id ? next : i)));
      const patch: { status?: Issue["status"]; description?: string; size?: string; cycleId?: string } = {};
      if (prevIssue?.status !== next.status) patch.status = next.status;
      if (prevIssue?.description !== next.description) patch.description = next.description;
      if (prevIssue?.size !== next.size) patch.size = next.size;
      if (prevIssue?.cycleId !== next.cycleId) patch.cycleId = next.cycleId;
      if (Object.keys(patch).length > 0) {
        updateIssueAction(next.id, patch).then(() => router.refresh());
      }
    },
    [issues, router]
  );

  const playTask = useCallback((task: Task) => {
    setTimer({ demandId: task.demandId || "", taskId: task.id, taskName: task.name, startedAt: Date.now(), baseSeconds: task.trackedSeconds });
    setNow(Date.now());
  }, []);

  const pauseTimer = useCallback(async (): Promise<number | null> => {
    let elapsed: number | null = null;
    setTimer((current) => {
      if (!current) return current;
      elapsed = Math.floor((Date.now() - current.startedAt) / 1000) + current.baseSeconds;
      void setTarefaTempoRastreado(current.taskId, elapsed);
      return null;
    });
    return elapsed;
  }, []);

  const openTask = useCallback(
    (task: Task) => {
      if (task.demandId) router.push(`/demandas/${task.demandId}/tarefas/${task.id}`);
    },
    [router]
  );

  const goToIssue = useCallback(
    (issueId: string) => {
      const issue = issues.find((i) => i.id === issueId);
      if (issue) router.push(`/ciclos/${issue.cycleId}/issue/${issue.id}`);
    },
    [issues, router]
  );

  const value = useMemo<AppShellValue>(
    () => ({ issues, cycles, currentCycle, updateIssue, timer, now, playTask, pauseTimer, openTask, goToIssue }),
    [issues, cycles, currentCycle, updateIssue, timer, now, playTask, pauseTimer, openTask, goToIssue]
  );

  return <AppShellCtx.Provider value={value}>{children}</AppShellCtx.Provider>;
}
