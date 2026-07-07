// A battle "attempt" gets exactly one idempotency key, generated the
// moment the attempt begins. That key is persisted to sessionStorage so
// a page refresh, a dropped connection, or tapping Retry Save all reuse
// the SAME key — the server-side RPC uses it to guarantee a battle can
// never be recorded (or scored, or rewarded) twice.

const STORAGE_PREFIX = "pc_pending_battle:";

export function generateIdempotencyKey(userId) {
  const rand = (crypto?.randomUUID && crypto.randomUUID()) || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${userId}-${rand}`;
}

/** slot identifies which flow owns this pending save, e.g. "battleFlow", "storyLevel". */
export function savePendingBattle(slot, key, payload) {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + slot, JSON.stringify({ key, payload, savedAt: Date.now() }));
  } catch (e) {
    // sessionStorage can fail in some private-browsing contexts — the
    // battle can still proceed, it just won't survive a hard refresh.
  }
}

export function getPendingBattle(slot) {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + slot);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function clearPendingBattle(slot) {
  try {
    sessionStorage.removeItem(STORAGE_PREFIX + slot);
  } catch (e) {
    // no-op
  }
}
