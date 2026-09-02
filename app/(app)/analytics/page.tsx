import { prisma } from "@/lib/db";
import { demandaInclude, serializeDemanda } from "@/lib/serialize";
import { AnalyticsView } from "@/components/analytics/AnalyticsView";

export default async function AnalyticsPage() {
  const rows = await prisma.demanda.findMany({ include: demandaInclude });
  const demands = rows.map(serializeDemanda);
  return <AnalyticsView demands={demands} />;
}
