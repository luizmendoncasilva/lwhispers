"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Mostra markdown renderizado; clicar entra em modo de edição (textarea crua), que ao perder foco volta a renderizar. */
export function MarkdownField({
  value,
  onChange,
  onCommit,
  placeholder,
  minRows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  onCommit: () => void;
  placeholder?: string;
  minRows?: number;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <TextField
        fullWidth
        multiline
        minRows={minRows}
        autoFocus
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => {
          setEditing(false);
          onCommit();
        }}
      />
    );
  }

  if (!value.trim()) {
    return (
      <Box
        onClick={() => setEditing(true)}
        sx={{ minHeight: 40, px: 1.5, py: 1.25, borderRadius: 1.5, border: "1px dashed", borderColor: "divider", cursor: "text" }}
      >
        <Typography sx={{ fontSize: 13.5, color: "text.disabled" }}>{placeholder}</Typography>
      </Box>
    );
  }

  return (
    <Box
      onClick={() => setEditing(true)}
      sx={{
        px: 1.5,
        py: 1.25,
        borderRadius: 1.5,
        border: "1px solid",
        borderColor: "divider",
        cursor: "text",
        fontSize: 13.5,
        lineHeight: 1.65,
        "& > *:first-of-type": { mt: 0 },
        "& > *:last-child": { mb: 0 },
        "& p": { m: "0 0 10px" },
        "& h1, & h2, & h3": { fontFamily: "var(--font-space-grotesk)", fontWeight: 600, m: "16px 0 8px", fontSize: "1.05em" },
        "& ul, & ol": { m: "0 0 10px", pl: 2.5 },
        "& li": { mb: 0.4 },
        "& code": { fontFamily: "var(--font-jetbrains-mono)", fontSize: "0.9em", bgcolor: "action.hover", borderRadius: 0.5, px: 0.5 },
        "& blockquote": { m: "0 0 10px", pl: 1.5, borderLeft: "3px solid", borderColor: "divider", color: "text.secondary" },
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: (props) => <Link {...props} onClick={(e) => e.stopPropagation()} target="_blank" rel="noreferrer" />,
        }}
      >
        {value}
      </ReactMarkdown>
    </Box>
  );
}
