"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { ColorChip } from "@/components/ui/Bits";
import { useConfigLists } from "@/components/ConfigListsContext";

export function LabelBadges({ names }: { names: string[] | undefined }) {
  const { wlabels } = useConfigLists();
  if (!names || names.length === 0) return null;
  return (
    <>
      {names.map((n) => {
        const wl = wlabels.find((w) => w.name === n);
        return (
          <ColorChip key={n} color={wl?.color}>
            {n}
          </ColorChip>
        );
      })}
    </>
  );
}

export function IssueBadgesCell({ ids, onGoToIssue }: { ids: string[]; onGoToIssue: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const shown = ids.slice(0, 3);
  const rest = ids.slice(3);
  if (ids.length === 0) return <Typography sx={{ fontSize: 11.5, color: "text.disabled" }}>—</Typography>;
  return (
    <Box sx={{ position: "relative", display: "flex", gap: 0.5, flexWrap: "wrap", alignItems: "center" }}>
      {shown.map((id) => (
        <ColorChip key={id} color="#9614d0" onClick={() => onGoToIssue(id)}>
          {id}
        </ColorChip>
      ))}
      {rest.length > 0 && (
        <>
          <Box
            component="button"
            onClick={() => setExpanded((v) => !v)}
            sx={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 10.5,
              color: "text.secondary",
              bgcolor: "background.default",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              px: 0.9,
              py: 0.3,
              cursor: "pointer",
            }}
          >
            +{rest.length}
          </Box>
          {expanded && (
            <Paper sx={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 20, p: 0.75, display: "flex", flexDirection: "column", gap: 0.4 }}>
              {rest.map((id) => (
                <ColorChip
                  key={id}
                  color="#9614d0"
                  onClick={() => {
                    setExpanded(false);
                    onGoToIssue(id);
                  }}
                >
                  {id}
                </ColorChip>
              ))}
            </Paper>
          )}
        </>
      )}
    </Box>
  );
}
