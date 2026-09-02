import "server-only";
import { createClient } from "@supabase/supabase-js";

export const ATTACHMENTS_BUCKET = "attachments";

export function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY não configuradas");
  return createClient(url, key, { auth: { persistSession: false } });
}
