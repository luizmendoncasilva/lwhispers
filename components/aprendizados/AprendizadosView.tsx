"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Button from "@mui/material/Button";
import { AcademicCapIcon, UsersIcon } from "@heroicons/react/24/outline";
import { ColorChip, InitialsAvatar, SectionLabel } from "@/components/ui/Bits";
import { SKILLS } from "@/lib/skills";
import { fmtDate } from "@/lib/format";
import { TODAY } from "@/lib/summary";
import { markStakeholderUpdate } from "@/actions/demandas";
import type { Demand } from "@/lib/types";

export function AprendizadosView({ demands }: { demands: Demand[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const skillDemands = SKILLS.map((skill) => ({ skill, demands: demands.filter((d) => (d.skills || []).includes(skill)) }));

  const stakeholderRows = demands
    .flatMap((d) =>
      d.people.map((p) => {
        const upd = (d.stakeholderUpdates || []).find((s) => s.person === p);
        const days = upd ? Math.floor((new Date(TODAY).getTime() - new Date(upd.lastSentAt).getTime()) / 86400000) : null;
        return { demandId: d.id, demandName: d.name, person: p, lastSentAt: upd?.lastSentAt || null, days };
      })
    )
    .sort((a, b) => (b.days ?? 9999) - (a.days ?? 9999));

  return (
    <Box sx={{ px: 3.5, py: 3.25, pb: 7.5, display: "flex", flexDirection: "column", gap: 3.75 }}>
      <Box>
        <SectionLabel icon={AcademicCapIcon}>Skills praticados</SectionLabel>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 1.5 }}>
          {skillDemands.map(({ skill, demands: ds }) => (
            <Card key={skill} sx={{ p: 2 }}>
              <Typography sx={{ fontFamily: "var(--font-space-grotesk)", fontWeight: 600, fontSize: 14, mb: 0.4 }}>{skill}</Typography>
              <Typography sx={{ fontSize: 11, color: "text.disabled", mb: 1.25 }}>{ds.length} demanda(s)</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {ds.map((d) => (
                  <ColorChip key={d.id}>{d.name}</ColorChip>
                ))}
                {ds.length === 0 && <Typography sx={{ fontSize: 11.5, color: "text.disabled" }}>Ainda sem exemplos.</Typography>}
              </Box>
            </Card>
          ))}
        </Box>
      </Box>

      <Box>
        <SectionLabel icon={UsersIcon}>Stakeholders — última atualização enviada</SectionLabel>
        <Card sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {["Pessoa", "Demanda", "Última atualização", "Dias atrás", ""].map((h) => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {stakeholderRows.map((row, i) => (
                <TableRow key={row.demandId + row.person + i}>
                  <TableCell sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <InitialsAvatar name={row.person} size={20} />
                    {row.person}
                  </TableCell>
                  <TableCell>{row.demandName}</TableCell>
                  <TableCell>{row.lastSentAt ? fmtDate(row.lastSentAt) : "nunca"}</TableCell>
                  <TableCell>
                    {row.days !== null ? <ColorChip color={row.days > 10 ? "#e05252" : undefined}>{row.days}d</ColorChip> : <ColorChip color="#e05252">sem registro</ColorChip>}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      sx={{ fontSize: 12, p: 0, minWidth: 0 }}
                      onClick={() => markStakeholderUpdate(row.demandId, row.person).then(() => startTransition(() => router.refresh()))}
                    >
                      marcar hoje
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {stakeholderRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: "center", color: "text.disabled", py: 3 }}>
                    Nenhuma pessoa interessada cadastrada em nenhuma demanda ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </Box>
    </Box>
  );
}
