import { prisma } from "@/lib/db";
import { demandaInclude, serializeDemanda } from "@/lib/serialize";
import { TarefasView } from "@/components/tarefas/TarefasView";

export default async function TarefasPage() {
  const rows = await prisma.demanda.findMany({ include: demandaInclude });
  const demands = rows.map(serializeDemanda);
  const tasks = demands.flatMap((d) => d.tasks);
  return <TarefasView tasks={tasks} />;
}
