"use client";

import { useState, useRef } from "react";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ArrowPathIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { ColorChip } from "@/components/ui/Bits";
import { useAppShell } from "@/components/AppShellContext";
import { fmtCycleRange } from "@/lib/format";
import type { Cycle } from "@/lib/types";

export function CycleSwitcherButton({
  selectedCycle,
  onSelect,
  label,
}: {
  selectedCycle: Cycle | null;
  onSelect: (c: Cycle | null) => void;
  label?: string;
}) {
  const { cycles, currentCycle } = useAppShell();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <>
      <Button
        ref={ref}
        variant="outlined"
        color="inherit"
        size="small"
        onClick={() => setAnchor(ref.current)}
        startIcon={<ArrowPathIcon width={13} height={13} />}
        endIcon={<ChevronDownIcon width={13} height={13} />}
        sx={{ whiteSpace: "nowrap", borderColor: "divider" }}
      >
        {label || `Cycle ${selectedCycle?.number ?? currentCycle?.number ?? "—"}`}
      </Button>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={{ paper: { sx: { width: 300, p: 1, mt: 1 } } }}
      >
        <Button
          fullWidth
          variant="text"
          size="small"
          onClick={() => {
            onSelect(currentCycle);
            setAnchor(null);
          }}
          sx={{ bgcolor: "primary.main", opacity: 0.1, mb: 0.75 }}
        >
          Ir para cycle atual
        </Button>
        {selectedCycle && (
          <Button
            fullWidth
            variant="text"
            color="inherit"
            size="small"
            onClick={() => {
              onSelect(null);
              setAnchor(null);
            }}
            sx={{ mb: 0.75 }}
          >
            Limpar filtro
          </Button>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
          {cycles
            .slice()
            .reverse()
            .map((c) => {
              const active = selectedCycle && c.id === selectedCycle.id;
              return (
                <Box
                  key={c.id}
                  component="button"
                  onClick={() => {
                    onSelect(c);
                    setAnchor(null);
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1.25,
                    px: 1.25,
                    py: 1,
                    borderRadius: 1.5,
                    border: "none",
                    cursor: "pointer",
                    bgcolor: active ? "action.selected" : "transparent",
                    textAlign: "left",
                  }}
                >
                  <Typography sx={{ fontSize: 13, display: "flex", alignItems: "center", gap: 0.9 }}>
                    Cycle {c.number} {c.current && <ColorChip color="#9614d0">atual</ColorChip>}
                  </Typography>
                  <Typography sx={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "text.disabled", whiteSpace: "nowrap" }}>
                    {fmtCycleRange(c)}
                  </Typography>
                </Box>
              );
            })}
        </Box>
      </Popover>
    </>
  );
}
