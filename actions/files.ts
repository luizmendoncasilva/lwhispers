"use server";

import { getSupabaseAdminClient, ATTACHMENTS_BUCKET } from "@/lib/supabase-admin";

export interface UploadedFile {
  name: string;
  url: string;
}

export async function uploadFile(folder: string, formData: FormData): Promise<UploadedFile> {
  const file = formData.get("file") as File | null;
  if (!file) throw new Error("Nenhum arquivo enviado.");

  const supabase = getSupabaseAdminClient();
  const path = `${folder}/${Date.now()}-${file.name}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(ATTACHMENTS_BUCKET).upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(ATTACHMENTS_BUCKET).getPublicUrl(path);
  return { name: file.name, url: data.publicUrl };
}

export async function deleteFileFromStorage(url: string) {
  try {
    const marker = `/${ATTACHMENTS_BUCKET}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return;
    const path = decodeURIComponent(url.slice(idx + marker.length));
    const supabase = getSupabaseAdminClient();
    await supabase.storage.from(ATTACHMENTS_BUCKET).remove([path]);
  } catch (err) {
    console.warn("Falha ao apagar arquivo do Storage:", (err as Error).message);
  }
}
