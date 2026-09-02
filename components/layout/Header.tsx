"use client";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import { ArrowRightStartOnRectangleIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppShell } from "@/components/AppShellContext";
import { logout } from "@/actions/auth";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { fmtHMS } from "@/lib/format";

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  ciclos: "Ciclos",
  demandas: "Demandas",
  tarefas: "Tarefas",
  analytics: "Analytics",
  aprendizados: "Aprendizados",
  configuracoes: "Configurações",
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const segment = pathname?.split("/")[1] || "dashboard";
  const { timer, now } = useAppShell();
  const elapsed = timer ? Math.floor((now - timer.startedAt) / 1000) + timer.baseSeconds : null;
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ gap: 1.75, minHeight: 62 }}>
        <Typography sx={{ fontFamily: "var(--font-space-grotesk)", fontWeight: 600, fontSize: 16 }}>
          {PAGE_TITLES[segment] || ""}
        </Typography>

        {timer && (
          <ButtonBase onClick={() => router.push(`/demandas/${timer.demandId}/tarefas/${timer.taskId}`)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.9,
              bgcolor: "primary.main",
              color: "#fff",
              borderRadius: 999,
              px: 1.4,
              py: 0.5,
            }}
          >
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#fff" }} className="lw-pulse" />
            <Typography sx={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 12 }}>{fmtHMS(elapsed || 0)}</Typography>
            <Typography sx={{ fontSize: 11.5, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {timer.taskName}
            </Typography>
          </ButtonBase>
        )}

        <Box sx={{ flex: 1 }} />

        <Button size="small" startIcon={<PlusIcon width={13} height={13} />} onClick={() => setCreateOpen(true)}>
          Criar Tarefa
        </Button>

        <Box sx={{ textAlign: "right" }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.2 }}>Luiz Mendonça</Typography>
          <Typography sx={{ fontSize: 10.5, color: "text.disabled", lineHeight: 1.2 }}>Product Designer</Typography>
        </Box>
        <Avatar sx={{ width: 34, height: 34, fontSize: 13, fontFamily: "var(--font-space-grotesk)", bgcolor: "background.default", color: "text.primary", border: "1px solid", borderColor: "divider" }}>
          LM
        </Avatar>
        <Box component="form" action={logout}>
          <IconButton type="submit" size="small" title="Sair">
            <ArrowRightStartOnRectangleIcon width={16} height={16} />
          </IconButton>
        </Box>
      </Toolbar>
      <CreateTaskDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </AppBar>
  );
}
