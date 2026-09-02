import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { demandaInclude, serializeDemanda } from "@/lib/serialize";
import { DemandFullPage } from "@/components/demandas/DemandFullPage";

export default async function DemandaDetailPage({ params }: { params: Promise<{ demandaId: string }> }) {
  const { demandaId } = await params;
  const [row, allRows] = await Promise.all([
    prisma.demanda.findUnique({ where: { id: demandaId }, include: demandaInclude }),
    prisma.demanda.findMany({ select: { id: true, nome: true } }),
  ]);
  if (!row) notFound();
  const demand = serializeDemanda(row);
  const allDemands = allRows.map((d) => ({ id: d.id, name: d.nome }));
  return <DemandFullPage demand={demand} allDemands={allDemands} />;
}
