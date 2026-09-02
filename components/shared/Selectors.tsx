"use client";

import { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import { PlusIcon, XMarkIcon, PaperClipIcon, LinkIcon } from "@heroicons/react/24/outline";
import { InitialsAvatar } from "@/components/ui/Bits";
import type { FileItem, LinkItem } from "@/lib/types";

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Buscar...",
  getColor,
  getLabel = (v: string) => v,
}: {
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  getColor?: (value: string) => string | undefined;
  getLabel?: (value: string) => string;
}) {
  return (
    <Autocomplete
      multiple
      size="small"
      options={options}
      value={selected}
      getOptionLabel={getLabel}
      onChange={(_, v) => onChange(v)}
      renderValue={(value, getItemProps) =>
        value.map((option, index) => {
          const { key, ...rest } = getItemProps({ index });
          return (
            <Chip
              key={key}
              {...rest}
              size="small"
              label={getLabel(option)}
              sx={getColor?.(option) ? { borderColor: getColor(option), color: getColor(option) } : undefined}
              variant="outlined"
            />
          );
        })
      }
      renderInput={(params) => <TextField {...params} placeholder={placeholder} />}
    />
  );
}

export function LinksField({ links, onAdd, onRemove }: { links: LinkItem[]; onAdd: (nome: string, url: string) => void; onRemove: (id: string) => void }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  function commit() {
    if (!name.trim() || !url.trim()) return;
    onAdd(name, url);
    setName("");
    setUrl("");
    setAdding(false);
  }
  return (
    <Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
        {links.map((l) => (
          <Box
            key={l.id}
            component="a"
            href={l.url}
            target="_blank"
            rel="noreferrer"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              px: 1.25,
              py: 0.9,
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.default",
              textDecoration: "none",
              color: "text.primary",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.9, minWidth: 0 }}>
              <LinkIcon width={13} height={13} />
              <Typography sx={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.name}</Typography>
            </Box>
            <Box
              component="span"
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                onRemove(l.id);
              }}
              sx={{ color: "text.disabled", cursor: "pointer", display: "flex" }}
            >
              <XMarkIcon width={13} height={13} />
            </Box>
          </Box>
        ))}
      </Box>
      {adding ? (
        <Box sx={{ display: "flex", gap: 0.75, mt: 1 }}>
          <TextField size="small" placeholder="Nome do link" value={name} onChange={(e) => setName(e.target.value)} sx={{ flex: 1 }} autoFocus />
          <TextField size="small" placeholder="https://" value={url} onChange={(e) => setUrl(e.target.value)} sx={{ flex: 1 }} />
          <Button size="small" onClick={commit}>
            <PlusIcon width={14} height={14} />
          </Button>
          <Button size="small" color="inherit" onClick={() => setAdding(false)}>
            <XMarkIcon width={14} height={14} />
          </Button>
        </Box>
      ) : (
        <Button size="small" startIcon={<PlusIcon width={13} height={13} />} onClick={() => setAdding(true)} sx={{ mt: 1, px: 0 }}>
          Adicionar link
        </Button>
      )}
    </Box>
  );
}

export function FilesField({ files, onAdd, onRemove }: { files: FileItem[]; onAdd: (nome: string) => void; onRemove: (id: string) => void }) {
  return (
    <Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
        {files.map((f) => (
          <Box
            key={f.id}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 1.25,
              py: 0.9,
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.default",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.9 }}>
              <PaperClipIcon width={13} height={13} />
              <Typography sx={{ fontSize: 13 }}>{f.name}</Typography>
            </Box>
            <Box onClick={() => onRemove(f.id)} sx={{ color: "text.disabled", cursor: "pointer", display: "flex" }}>
              <XMarkIcon width={13} height={13} />
            </Box>
          </Box>
        ))}
      </Box>
      <Button
        size="small"
        startIcon={<PlusIcon width={13} height={13} />}
        onClick={() => onAdd(`arquivo-${files.length + 1}.pdf`)}
        sx={{ mt: 1, px: 0 }}
      >
        Anexar arquivo
      </Button>
    </Box>
  );
}

export function PeopleMultiSelect({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  return (
    <Autocomplete
      multiple
      size="small"
      options={options}
      value={selected}
      onChange={(_, v) => onChange(v)}
      renderValue={(value, getItemProps) =>
        value.map((option, index) => {
          const { key, ...rest } = getItemProps({ index });
          return <Chip key={key} {...rest} size="small" avatar={<InitialsAvatar name={option} size={20} />} label={option} variant="outlined" />;
        })
      }
      renderInput={(params) => <TextField {...params} placeholder="Buscar pessoa..." />}
    />
  );
}
