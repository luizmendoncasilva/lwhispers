"use client";

import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ColorChip, InitialsAvatar } from "@/components/ui/Bits";
import { LabelBadges, IssueBadgesCell } from "@/components/shared/IssueBadges";
import { useAppShell } from "@/components/AppShellContext";
import { fmtDate, fmtHM } from "@/lib/format";
import type { Task } from "@/lib/types";

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, py: 0.35 }}>
      <Typography sx={{ width: 68, flexShrink: 0, fontFamily: "var(--font-jetbrains-mono)", fontSize: 9.5, color: "text.disabled", pt: 0.2 }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexWrap: "wrap", gap: 0.5, alignItems: "center" }}>{children}</Box>
    </Box>
  );
}

export function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const { timer, now, goToIssue } = useAppShell();
  const isRunning = timer?.taskId === task.id;
  const seconds = isRunning ? Math.floor((now - timer!.startedAt) / 1000) + timer!.baseSeconds : task.trackedSeconds;

  return (
    <Card>
      <CardActionArea onClick={onClick} sx={{ p: 1.5 }}>
        <Typography sx={{ fontSize: 13, mb: 1, lineHeight: 1.35, fontWeight: 500 }}>{task.name}</Typography>
        <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 0.75 }}>
          <InfoRow label="TAMANHO">
            <ColorChip>{task.size}</ColorChip>
          </InfoRow>
          <InfoRow label="INÍCIO">
            <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>{fmtDate(task.start)}</Typography>
          </InfoRow>
          <InfoRow label="FIM">
            <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>{fmtDate(task.end)}</Typography>
          </InfoRow>
          <InfoRow label="PESSOAS">
            {task.people.length > 0 ? (
              <Box sx={{ display: "flex", ml: -0.25 }}>
                {task.people.slice(0, 4).map((p) => (
                  <Box key={p} sx={{ ml: -0.5, border: "2px solid", borderColor: "background.paper", borderRadius: "50%" }}>
                    <InitialsAvatar name={p} size={18} />
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography sx={{ fontSize: 11.5, color: "text.disabled" }}>—</Typography>
            )}
          </InfoRow>
          {task.labels.length > 0 && (
            <InfoRow label="LABELS">
              <LabelBadges names={task.labels.slice(0, 3)} />
            </InfoRow>
          )}
          <InfoRow label="ISSUE">
            {task.relatedIssueIds.length > 0 ? (
              <Box onClick={(e) => e.stopPropagation()}>
                <IssueBadgesCell ids={task.relatedIssueIds} onGoToIssue={goToIssue} />
              </Box>
            ) : (
              <Typography sx={{ fontSize: 11.5, color: "text.disabled" }}>—</Typography>
            )}
          </InfoRow>
          <InfoRow label="TEMPO">
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
              {isRunning && <Box className="lw-pulse" sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "primary.main" }} />}
              <Typography sx={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11.5, color: isRunning ? "primary.main" : "text.secondary" }}>
                {fmtHM(seconds)}
              </Typography>
            </Box>
          </InfoRow>
        </Box>
      </CardActionArea>
    </Card>
  );
}
