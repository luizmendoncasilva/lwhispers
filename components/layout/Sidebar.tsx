"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import {
  HomeIcon,
  ArrowPathIcon,
  RectangleStackIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  AcademicCapIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/ciclos", label: "Ciclos", icon: ArrowPathIcon },
  { href: "/demandas", label: "Demandas", icon: RectangleStackIcon },
  { href: "/tarefas", label: "Tarefas", icon: ClipboardDocumentListIcon },
  { href: "/analytics", label: "Analytics", icon: ChartBarIcon },
  { href: "/aprendizados", label: "Aprendizados", icon: AcademicCapIcon },
  { href: "/configuracoes", label: "Configurações", icon: Cog6ToothIcon },
];

const DRAWER_WIDTH = 216;

export function Sidebar() {
  const pathname = usePathname();
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box", px: 1.25, py: 2.5 },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.1, px: 1, mb: 3.5 }}>
        <Box
          sx={{
            width: 26,
            height: 26,
            borderRadius: "7px",
            bgcolor: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: (t) => `0 0 18px ${t.palette.primary.main}33`,
          }}
        >
          <Typography sx={{ fontFamily: "var(--font-space-grotesk)", fontWeight: 700, fontSize: 13, color: "#fff" }}>L</Typography>
        </Box>
        <Typography sx={{ fontFamily: "var(--font-space-grotesk)", fontWeight: 600, fontSize: 15.5, letterSpacing: -0.2 }}>
          L.whispers
        </Typography>
      </Box>

      <List sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={active}
              sx={{
                gap: 1.25,
                py: 1,
                "&.Mui-selected": { bgcolor: "primary.main", color: "#fff", "&:hover": { bgcolor: "primary.dark" } },
                "&.Mui-selected .MuiListItemIcon-root": { color: "#fff" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, color: active ? "#fff" : "text.secondary" }}>
                <Icon width={17} height={17} />
              </ListItemIcon>
              <ListItemText slotProps={{ primary: { sx: { fontSize: 13.5, fontWeight: 500 } } }}>{item.label}</ListItemText>
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ mt: "auto", px: 1, pt: 1.5 }}>
        <Typography sx={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 10, color: "text.disabled", letterSpacing: 0.3 }}>
          v0.2 · Fase 2
        </Typography>
      </Box>
    </Drawer>
  );
}

export const SIDEBAR_WIDTH = DRAWER_WIDTH;
