"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { SparklesIcon, ListBulletIcon, ExclamationTriangleIcon, ClipboardDocumentIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { ColorChip, SectionLabel } from "@/components/ui/Bits";
import { StatusCard } from "@/components/ciclos/StatusCard";
import { IssueListDialog } from "@/components/ciclos/IssueListDialog";
import { CycleSwitcherButton } from "@/components/shared/CycleSwitcher";
import { TaskTable } from "@/components/tasks/TaskTable";
import { STATUS_DEFS } from "@/lib/mock-issues";
import { STATUS_ICONS } from "@/components/ciclos/statusIcons";
import { useAppShell } from "@/components/AppShellContext";
import { useSummaryGenerator } from "@/components/shared/useSummaryGenerator";
import { completedYesterday, TODAY } from "@/lib/summary";
import type { Cycle, Demand, Issue, IssueStatus } from "@/lib/types";

export function DashboardView({ demands }: { demands: Demand[] }) {
  const router = useRouter();
  const { issues, openTask, currentCycle } = useAppShell();
  const [selectedCycle, setSelectedCycle] = useState<Cycle | null>(currentCycle);
  const [openStatus, setOpenStatus] = useState<IssueStatus | null>(null);
  const { summary, loading, source, generate } = useSummaryGenerator();
  const [copied, setCopied] = useState(false);

  const cycleIssues = selectedCycle ? issues.filter((i) => i.cycleId === selectedCycle.id) : [];
  const inProgress = cycleIssues.filter((i) => i.status === "em_andamento");

  const allTasks = demands.flatMap((d) => d.tasks);
  const todaysTasks = allTasks.filter((tk) => tk.start && tk.start <= TODAY && (tk.end || tk.start)! >= TODAY);
  const overdueTasks = allTasks.filter((tk) => tk.end && tk.end <= TODAY && tk.status !== "Concluído");
  const done = completedYesterday(demands);
  const statuses = Array.from(new Set(todaysTasks.map((t) => t.status)));

  function goToIssueDetail(issue: Issue) {
    router.push(`/ciclos/${issue.cycleId}/issue/${issue.id}`);
  }

  return (
    <Box sx={{ px: 3.5, py: 3.25, pb: 7.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.25 }}>
        <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>Suas issues atribuídas, por status</Typography>
        <CycleSwitcherButton selectedCycle={selectedCycle} onSelect={(c) => setSelectedCycle(c || currentCycle)} />
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 4.5 }}>
        {STATUS_DEFS.map((def) => {
          const count = cycleIssues.filter((i) => i.status === def.key).length;
          if (def.key === "cancelado" && count === 0) return null;
          return <StatusCard key={def.key} icon={STATUS_ICONS[def.key]} label={def.label} count={count} onClick={() => setOpenStatus(def.key)} />;
        })}
      </Box>

      <SectionLabel icon={SparklesIcon}>Concluídas ontem</SectionLabel>
      <Card sx={{ p: 2, mb: 4.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: done.length ? 1.5 : 0 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            {done.map(({ demand, task }) => (
              <Box key={task.id} sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: 13 }}>
                <CheckCircleIcon width={13} height={13} />
                <span>{task.name}</span>
                <Typography component="span" sx={{ color: "text.disabled", fontSize: 11.5 }}>
                  · {demand.name}
                </Typography>
              </Box>
            ))}
            {done.length === 0 && <Typography sx={{ fontSize: 12.5, color: "text.disabled" }}>Nada concluído ontem.</Typography>}
          </Box>
          <Button size="small" startIcon={<SparklesIcon width={13} height={13} />} disabled={done.length === 0 || loading} onClick={() => generate("daily")}>
            {loading ? "Gerando..." : "Gerar resumo"}
          </Button>
        </Box>
        {summary && (
          <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 0.75 }}>
              <Button
                size="small"
                color="inherit"
                startIcon={<ClipboardDocumentIcon width={12} height={12} />}
                onClick={() => {
                  navigator.clipboard?.writeText(summary);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
              >
                {copied ? "Copiado!" : "Copiar"}
              </Button>
            </Box>
            <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.6 }}>{summary}</Typography>
            <Typography sx={{ mt: 1, fontSize: 10.5, fontFamily: "var(--font-jetbrains-mono)", color: "text.disabled" }}>
              {source === "gemini" ? "gerado via Gemini" : "gerado localmente (IA indisponível no momento)"}
            </Typography>
          </Box>
        )}
      </Card>

      <SectionLabel>Trabalho em andamento</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 1.5, mb: 4.5 }}>
        {inProgress.map((iss) => (
          <Card key={iss.id}>
            <CardActionArea onClick={() => goToIssueDetail(iss)} sx={{ p: 1.75 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.25 }}>
                <ColorChip color="#9614d0">{iss.team}</ColorChip>
                <Typography sx={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "text.disabled" }}>{iss.id}</Typography>
              </Box>
              <Typography sx={{ fontSize: 13.5, lineHeight: 1.4, mb: 1.5 }}>{iss.name}</Typography>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                  {iss.labels.slice(0, 2).map((l) => (
                    <ColorChip key={l}>{l}</ColorChip>
                  ))}
                </Box>
                <ColorChip outline>{iss.size}</ColorChip>
              </Box>
            </CardActionArea>
          </Card>
        ))}
        {inProgress.length === 0 && <Typography sx={{ color: "text.disabled", fontSize: 13 }}>Nada em andamento neste cycle.</Typography>}
      </Box>

      <Box sx={{ mb: 4.5 }}>
        <SectionLabel icon={ListBulletIcon}>Tarefas de hoje</SectionLabel>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
          {statuses.map((status) => {
            const list = todaysTasks.filter((tk) => tk.status === status);
            if (list.length === 0) return null;
            return (
              <Box key={status}>
                <Typography sx={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 10.5, color: "text.disabled", mb: 0.75, letterSpacing: 0.3 }}>
                  {status.toUpperCase()}
                </Typography>
                <TaskTable tasks={list} showDemand onOpenTask={openTask} />
              </Box>
            );
          })}
          {todaysTasks.length === 0 && <Typography sx={{ color: "text.disabled", fontSize: 13 }}>Nenhuma tarefa prevista pra hoje.</Typography>}
        </Box>
      </Box>

      <Box>
        <SectionLabel icon={ExclamationTriangleIcon}>Atrasadas — previstas e não concluídas</SectionLabel>
        <TaskTable tasks={overdueTasks} showStatus showDemand onOpenTask={openTask} />
      </Box>

      {openStatus && (
        <IssueListDialog
          statusKey={openStatus}
          statusLabel={STATUS_DEFS.find((s) => s.key === openStatus)!.label}
          issues={cycleIssues.filter((i) => i.status === openStatus)}
          onClose={() => setOpenStatus(null)}
          onOpenIssue={(iss) => {
            setOpenStatus(null);
            goToIssueDetail(iss);
          }}
        />
      )}
    </Box>
  );
}
