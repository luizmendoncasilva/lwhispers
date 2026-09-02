import { prisma } from "@/lib/db";
import { demandaInclude, serializeDemanda } from "@/lib/serialize";
import { DemandasListView } from "@/components/demandas/DemandasListView";

export default async function DemandasPage() {
  const rows = await prisma.demanda.findMany({ include: demandaInclude, orderBy: { createdAt: "desc" } });
  const demands = rows.map(serializeDemanda);
  return <DemandasListView demands={demands} />;
}
