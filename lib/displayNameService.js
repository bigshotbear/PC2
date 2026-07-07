import { supabase } from "./supabaseClient";

export function normalizeDisplayName(name) {
  return (name || "").trim().toLowerCase();
}

export function validateDisplayNameFormat(name) {
  const trimmed = (name || "").trim();
  if (trimmed.length < 3) return "Display name must be at least 3 characters.";
  if (trimmed.length > 20) return "Display name must be 20 characters or fewer.";
  if (!/^[a-zA-Z0-9 _-]+$/.test(trimmed)) return "Only letters, numbers, spaces, hyphens, and underscores are allowed.";
  return null;
}

export async function isDisplayNameAvailable(name) {
  const { data, error } = await supabase.rpc("is_display_name_available", { candidate: name });
  if (error) return { available: false, error: error.message };
  return { available: !!data, error: null };
}

export async function saveDisplayName(userId, name) {
  const formatError = validateDisplayNameFormat(name);
  if (formatError) return { success: false, error: formatError };

  const { available, error: checkError } = await isDisplayNameAvailable(name);
  if (checkError) return { success: false, error: checkError };
  if (!available) return { success: false, error: "That display name is already taken." };

  const trimmed = name.trim();
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: trimmed, normalized_display_name: normalizeDisplayName(trimmed), updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
