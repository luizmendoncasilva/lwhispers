"use client";

import { createClient } from "@supabase/supabase-js";

export const ATTACHMENTS_BUCKET = "attachments";

export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY não configuradas");
  return createClient(url, key);
}
