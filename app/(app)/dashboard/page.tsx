import { prisma } from "@/lib/db";
import { demandaInclude, serializeDemanda } from "@/lib/serialize";
import { DashboardView } from "@/components/dashboard/DashboardView";

export default async function DashboardPage() {
  const rows = await prisma.demanda.findMany({ include: demandaInclude });
  const demands = rows.map(serializeDemanda);
  return <DashboardView demands={demands} />;
}
