"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import Box from "@mui/material/Box";
import { IssueDetailView } from "@/components/ciclos/IssueDetailView";

export default function IssueDetailPage({ params }: { params: Promise<{ cycleId: string; issueId: string }> }) {
  const { cycleId, issueId } = use(params);
  const router = useRouter();
  return (
    <Box>
      <IssueDetailView issueId={issueId} onBack={() => router.push(`/ciclos/${cycleId}`)} />
    </Box>
  );
}
