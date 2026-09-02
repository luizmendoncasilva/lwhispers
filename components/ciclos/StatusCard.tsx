"use client";

import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import type { IssueStatus } from "@/lib/types";

export function StatusCard({
  icon: Icon,
  label,
  count,
  onClick,
}: {
  icon: React.ComponentType<{ width?: number; height?: number }>;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <Card sx={{ flex: "1 1 150px", minWidth: 150 }}>
      <CardActionArea onClick={onClick} sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.75 }}>
          <Icon width={16} height={16} />
          <ChevronRightIcon width={14} height={14} />
        </Box>
        <Typography sx={{ fontFamily: "var(--font-space-grotesk)", fontSize: 26, fontWeight: 600, lineHeight: 1 }}>{count}</Typography>
        <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: 0.75 }}>{label}</Typography>
      </CardActionArea>
    </Card>
  );
}

export type { IssueStatus };
