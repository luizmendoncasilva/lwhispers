"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import MuiBreadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { useEffectiveBreadcrumbs } from "@/components/layout/BreadcrumbsContext";

export function Breadcrumbs() {
  const crumbs = useEffectiveBreadcrumbs();

  return (
    <Box sx={{ px: 3.5, py: 1.1, borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
      <MuiBreadcrumbs separator={<ChevronRightIcon width={12} height={12} />} sx={{ fontSize: 12.5 }}>
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          if (c.href && !isLast) {
            return (
              <Typography
                key={i}
                component={Link}
                href={c.href}
                sx={{
                  fontSize: 12.5,
                  color: "text.secondary",
                  textDecoration: "none",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 240,
                  "&:hover": { color: "primary.main" },
                }}
              >
                {c.label}
              </Typography>
            );
          }
          return (
            <Typography
              key={i}
              sx={{
                fontSize: 12.5,
                color: isLast ? "text.primary" : "text.secondary",
                fontWeight: isLast ? 500 : 400,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 320,
              }}
            >
              {c.label}
            </Typography>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
}
