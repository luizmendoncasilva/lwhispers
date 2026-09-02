import { prisma } from "@/lib/db";
import { demandaInclude, serializeDemanda } from "@/lib/serialize";
import { AprendizadosView } from "@/components/aprendizados/AprendizadosView";

export default async function AprendizadosPage() {
  const rows = await prisma.demanda.findMany({ include: demandaInclude });
  const demands = rows.map(serializeDemanda);
  return <AprendizadosView demands={demands} />;
}
