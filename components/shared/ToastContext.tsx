"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

interface ToastValue {
  showError: (message: string) => void;
}

const ToastCtx = createContext<ToastValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast deve ser usado dentro de ToastProvider");
  return ctx;
}

/** Chama uma Server Action fire-and-forget; se falhar, mostra um toast de erro. */
export function runOrToast<T>(promise: Promise<T>, showError: (msg: string) => void, context?: string) {
  promise.catch((err) => {
    showError(context ? `${context}: ${(err as Error).message}` : (err as Error).message);
  });
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const showError = useCallback((msg: string) => setMessage(msg), []);

  return (
    <ToastCtx.Provider value={{ showError }}>
      {children}
      <Snackbar open={Boolean(message)} autoHideDuration={5000} onClose={() => setMessage(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="error" onClose={() => setMessage(null)} sx={{ maxWidth: 420 }}>
          Não foi possível salvar: {message}
        </Alert>
      </Snackbar>
    </ToastCtx.Provider>
  );
}
