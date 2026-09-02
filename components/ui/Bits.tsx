"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { alpha, useTheme } from "@mui/material/styles";

export function ColorChip({
  children,
  color,
  outline,
  onClick,
  size = "small",
}: {
  children: ReactNode;
  color?: string;
  outline?: boolean;
  onClick?: () => void;
  size?: "small" | "medium";
}) {
  const theme = useTheme();
  const c = color || theme.palette.text.secondary;
  return (
    <Chip
      label={children}
      size={size}
      onClick={onClick}
      variant={outline ? "outlined" : "filled"}
      sx={{
        bgcolor: outline ? "transparent" : alpha(c, 0.13),
        color: c,
        border: `1px solid ${alpha(c, 0.35)}`,
        cursor: onClick ? "pointer" : "default",
      }}
    />
  );
}

export function SectionLabel({ children, icon: Icon }: { children: ReactNode; icon?: React.ComponentType<{ width?: number; height?: number }> }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.9, mb: 1.1 }}>
      {Icon && <Icon width={13} height={13} />}
      <Typography sx={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, letterSpacing: 0.3, color: "text.disabled" }}>
        {children}
      </Typography>
    </Box>
  );
}

function initials(name: string) {
  return name
    .replace("(você)", "")
    .trim()
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function InitialsAvatar({ name, size = 26 }: { name: string; size?: number }) {
  return (
    <Avatar
      title={name}
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        fontFamily: "var(--font-space-grotesk)",
        fontWeight: 600,
        bgcolor: "background.default",
        color: "text.primary",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      {initials(name)}
    </Avatar>
  );
}

export function BackButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <Box
      component="button"
      onClick={onClick}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        background: "none",
        border: "none",
        color: "text.secondary",
        fontSize: 13,
        cursor: "pointer",
        p: 0,
        mb: 2,
      }}
    >
      <ChevronLeftIcon width={15} height={15} /> {children}
    </Box>
  );
}

export function IconBtn({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <IconButton
      onClick={onClick}
      size="small"
      sx={{
        width: 32,
        height: 32,
        border: "1px solid",
        borderColor: active ? "primary.main" : "divider",
        bgcolor: active ? alpha("#9614d0", 0.12) : "transparent",
        color: active ? "primary.main" : "text.secondary",
      }}
    >
      {children}
    </IconButton>
  );
}
