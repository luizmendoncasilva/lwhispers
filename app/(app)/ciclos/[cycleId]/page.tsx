import { notFound } from "next/navigation";
import { CycleDetailView } from "@/components/ciclos/CycleDetailView";
import { getIssuesAndCycles } from "@/lib/issues-data";

export default async function CycleDetailPage({ params }: { params: Promise<{ cycleId: string }> }) {
  const { cycleId } = await params;
  const { cycles } = await getIssuesAndCycles();
  const cycle = cycles.find((c) => c.id === cycleId);
  if (!cycle) notFound();
  return <CycleDetailView cycle={cycle} />;
}
