import { supabase } from "./supabaseClient";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];
const MAX_BYTES = 5 * 1024 * 1024;

export function validateImageFile(file) {
  if (!file) return { valid: false, error: "No file selected." };

  const lowerName = file.name.toLowerCase();
  const hasAllowedExtension = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));

  if (file.type.startsWith("video/")) return { valid: false, error: "Videos are not supported." };
  if (!ALLOWED_TYPES.includes(file.type) || !hasAllowedExtension) {
    return { valid: false, error: "Please choose a PNG, JPG, or WEBP image." };
  }
  if (file.size > MAX_BYTES) return { valid: false, error: "Image must be smaller than 5 MB." };

  return { valid: true };
}

function safeFileName(name) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").slice(-60);
}

export async function uploadPortrait(userId, fighterId, file) {
  const check = validateImageFile(file);
  if (!check.valid) return { success: false, error: check.error };

  const path = `${userId}/${fighterId}/${Date.now()}-${safeFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from("fighter-portraits")
    .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });

  if (uploadError) return { success: false, error: "Upload failed. Please try again." };

  const { data } = supabase.storage.from("fighter-portraits").getPublicUrl(path);
  return { success: true, url: data.publicUrl };
}
