import { createClient } from "@supabase/supabase-js";

export function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const STORAGE_BUCKETS = {
  avatars: "avatars",
  challenges: "challenges",
  ranks: "ranks",
  funds: "funds",
  news: "news",
} as const;

export type StorageBucket = keyof typeof STORAGE_BUCKETS;

export async function uploadToSupabase(
  bucket: StorageBucket,
  filePath: string,
  file: File,
) {
  const supabase = createSupabaseAdmin();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .upload(filePath, buffer, {
      upsert: true,
      contentType: file.type || "application/octet-stream",
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function deleteFromSupabase(
  bucket: StorageBucket,
  filePath: string,
) {
  const supabase = createSupabaseAdmin();
  await supabase.storage.from(STORAGE_BUCKETS[bucket]).remove([filePath]);
}

export function buildStoragePath(prefix: string, fileName: string) {
  const ext = fileName.split(".").pop() ?? "jpg";
  return `${prefix}/${crypto.randomUUID()}.${ext}`;
}
