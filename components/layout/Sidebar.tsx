"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import {
  HomeIcon,
  ArrowPathIcon,
  RectangleStackIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  AcademicCapIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
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
const COLLAPSED_WIDTH = 68;
const STORAGE_KEY = "lwhispers.sidebar.collapsed";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  };

  const width = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        transition: hydrated ? (t) => t.transitions.create("width", { duration: t.transitions.duration.shorter }) : undefined,
        "& .MuiDrawer-paper": {
          width,
          boxSizing: "border-box",
          px: collapsed ? 0.75 : 1.25,
          py: 2.5,
          overflowX: "hidden",
          transition: hydrated ? (t) => t.transitions.create("width", { duration: t.transitions.duration.shorter }) : undefined,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.1, px: collapsed ? 0.25 : 1, mb: 3.5, justifyContent: collapsed ? "center" : "flex-start" }}>
        <Box
          sx={{
            width: 26,
            height: 26,
            flexShrink: 0,
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
        {!collapsed && (
          <Typography
            noWrap
            sx={{ fontFamily: "var(--font-space-grotesk)", fontWeight: 600, fontSize: 15.5, letterSpacing: -0.2 }}
          >
            L.whispers
          </Typography>
        )}
      </Box>

      <List sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          const Icon = item.icon;
          const button = (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={active}
              sx={{
                gap: 1.25,
                py: 1,
                justifyContent: collapsed ? "center" : "flex-start",
                "&.Mui-selected": { bgcolor: "primary.main", color: "#fff", "&:hover": { bgcolor: "primary.dark" } },
                "&.Mui-selected .MuiListItemIcon-root": { color: "#fff" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, color: active ? "#fff" : "text.secondary" }}>
                <Icon width={17} height={17} />
              </ListItemIcon>
              {!collapsed && (
                <ListItemText slotProps={{ primary: { sx: { fontSize: 13.5, fontWeight: 500 } } }}>{item.label}</ListItemText>
              )}
            </ListItemButton>
          );
          return collapsed ? (
            <Tooltip key={item.href} title={item.label} placement="right">
              {button}
            </Tooltip>
          ) : (
            button
          );
        })}
      </List>

      <Box sx={{ mt: "auto", px: collapsed ? 0 : 1, pt: 1.5, display: "flex", flexDirection: "column", gap: 1, alignItems: collapsed ? "center" : "stretch" }}>
        <Tooltip title={collapsed ? "Expandir menu" : "Recolher menu"} placement="right">
          <IconButton
            onClick={toggleCollapsed}
            size="small"
            sx={{
              alignSelf: collapsed ? "center" : "flex-end",
              color: "text.secondary",
              border: (t) => `1px solid ${t.palette.divider}`,
            }}
          >
            {collapsed ? <ChevronRightIcon width={15} height={15} /> : <ChevronLeftIcon width={15} height={15} />}
          </IconButton>
        </Tooltip>
        {!collapsed && (
          <Typography sx={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 10, color: "text.disabled", letterSpacing: 0.3 }}>
            v0.2 · Fase 2
          </Typography>
        )}
      </Box>
    </Drawer>
  );
}

export const SIDEBAR_WIDTH = DRAWER_WIDTH;
export const SIDEBAR_COLLAPSED_WIDTH = COLLAPSED_WIDTH;
