"use client";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Checkbox from "@mui/material/Checkbox";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAppShell } from "@/components/AppShellContext";

export function IssuePickerDialog({
  alreadySelected,
  onClose,
  onToggle,
}: {
  alreadySelected: string[];
  onClose: () => void;
  onToggle: (issueId: string) => void;
}) {
  const { issues, currentCycle } = useAppShell();
  const cycleIssues = issues.filter((i) => i.cycleId === currentCycle?.id);
  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography sx={{ fontFamily: "var(--font-space-grotesk)", fontWeight: 600, fontSize: 15 }}>
          Issues do Cycle {currentCycle?.number ?? "—"}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <XMarkIcon width={15} height={15} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ maxHeight: 420, p: 1 }}>
        {cycleIssues.map((iss) => {
          const checked = alreadySelected.includes(iss.id);
          return (
            <Box
              key={iss.id}
              component="button"
              onClick={() => onToggle(iss.id)}
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                px: 1.25,
                py: 1,
                borderRadius: 1.5,
                border: "none",
                bgcolor: checked ? "action.selected" : "transparent",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <Checkbox checked={checked} size="small" sx={{ p: 0 }} />
              <Typography sx={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11.5, color: "primary.main", flexShrink: 0 }}>{iss.id}</Typography>
              <Typography sx={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{iss.name}</Typography>
            </Box>
          );
        })}
      </DialogContent>
    </Dialog>
  );
}
