import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { demandaInclude, serializeTarefa } from "@/lib/serialize";
import { TaskDetailView } from "@/components/tasks/TaskDetailView";

export default async function TarefaDetailPage({ params }: { params: Promise<{ demandaId: string; taskId: string }> }) {
  const { demandaId, taskId } = await params;
  const demanda = await prisma.demanda.findUnique({ where: { id: demandaId } });
  if (!demanda) notFound();

  const tarefaRow = await prisma.tarefa.findUnique({
    where: { id: taskId },
    include: demandaInclude.tarefas.include,
  });
  if (!tarefaRow || tarefaRow.demandaId !== demandaId) notFound();

  const task = serializeTarefa(tarefaRow, demandaId, demanda.nome);
  return <TaskDetailView task={task} demandaId={demandaId} demandaNome={demanda.nome} />;
}
