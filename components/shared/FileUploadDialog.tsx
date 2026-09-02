"use client";

import { useRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import { ArrowUpTrayIcon, DocumentIcon } from "@heroicons/react/24/outline";
import { uploadFile, type UploadedFile } from "@/actions/files";

export function FileUploadDialog({
  open,
  onClose,
  folder,
  onUploaded,
}: {
  open: boolean;
  onClose: () => void;
  /** pasta dentro do bucket, ex: `tarefas/{id}` */
  folder: string;
  onUploaded: (file: UploadedFile) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFiles(files: FileList | File[]) {
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.set("file", file);
        const result = await uploadFile(folder, formData);
        onUploaded(result);
      }
      onClose();
    } catch (err) {
      setError(`Não foi possível enviar o arquivo: ${(err as Error).message}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onClose={uploading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Anexar arquivo</DialogTitle>
      <DialogContent>
        <Box
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          sx={{
            border: "2px dashed",
            borderColor: dragging ? "primary.main" : "divider",
            bgcolor: dragging ? "action.hover" : "background.default",
            borderRadius: 2,
            py: 4,
            px: 2,
            textAlign: "center",
            cursor: "pointer",
            transition: "all .15s ease",
          }}
        >
          {uploading ? (
            <>
              <Typography sx={{ fontSize: 13, mb: 1.5 }}>Enviando...</Typography>
              <LinearProgress />
            </>
          ) : (
            <>
              {dragging ? <ArrowUpTrayIcon width={28} height={28} /> : <DocumentIcon width={28} height={28} style={{ opacity: 0.5 }} />}
              <Typography sx={{ fontSize: 13, mt: 1.5 }}>Arraste um arquivo aqui ou clique pra escolher</Typography>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files?.length) uploadFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </Box>
        {error && <Typography sx={{ fontSize: 12, color: "error.main", mt: 1.5 }}>{error}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose} disabled={uploading}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
