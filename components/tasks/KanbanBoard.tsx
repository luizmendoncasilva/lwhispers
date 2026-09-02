"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { TaskCard } from "@/components/tasks/TaskCard";
import { CompletionDateDialog } from "@/components/tasks/CompletionDateDialog";
import { useConfigLists } from "@/components/ConfigListsContext";
import type { MetaStatus, Task } from "@/lib/types";

export function KanbanBoard({
  tasks,
  onOpenTask,
  onStatusChange,
}: {
  tasks: Task[];
  onOpenTask: (task: Task) => void;
  onStatusChange: (task: Task, status: MetaStatus, completionDate?: string) => void;
}) {
  const { statusTarefa } = useConfigLists();
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [pending, setPending] = useState<{ task: Task; status: MetaStatus } | null>(null);

  function handleDrop(status: MetaStatus, e: React.DragEvent) {
    e.preventDefault();
    setDragOver(null);
    const taskId = e.dataTransfer.getData("text/task-id");
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === status.name) return;
    if (status.name === "Concluído") {
      setPending({ task, status });
    } else {
      onStatusChange(task, status);
    }
  }

  return (
    <>
      <Box sx={{ display: "flex", gap: 1.5, overflowX: "auto", pb: 0.75 }}>
        {statusTarefa.map((status) => {
          const list = tasks.filter((t) => t.status === status.name);
          return (
            <Box
              key={status.id}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(status.id);
              }}
              onDragLeave={() => setDragOver((d) => (d === status.id ? null : d))}
              onDrop={(e) => handleDrop(status, e)}
              sx={{
                minWidth: 220,
                flex: "1 0 220px",
                borderRadius: 2,
                p: 0.5,
                bgcolor: dragOver === status.id ? "action.hover" : "transparent",
                border: "2px dashed",
                borderColor: dragOver === status.id ? "primary.main" : "transparent",
              }}
            >
              <Typography sx={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 10.5, color: "text.disabled", mb: 1, letterSpacing: 0.3, px: 0.5 }}>
                {status.name.toUpperCase()} · {list.length}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {list.map((tk) => (
                  <TaskCard key={tk.id} task={tk} draggable onClick={() => onOpenTask(tk)} />
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>

      <CompletionDateDialog
        open={Boolean(pending)}
        onClose={() => setPending(null)}
        onConfirm={(date) => {
          if (pending) onStatusChange(pending.task, pending.status, date);
          setPending(null);
        }}
      />
    </>
  );
}
