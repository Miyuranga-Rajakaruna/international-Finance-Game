const KEY = "op1982.player";

export type StoredPlayer = { id: string; name: string };

export function getStoredPlayer(): StoredPlayer | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredPlayer) : null;
  } catch {
    return null;
  }
}

export function storePlayer(player: StoredPlayer) {
  window.localStorage.setItem(KEY, JSON.stringify(player));
}

export function clearPlayer() {
  window.localStorage.removeItem(KEY);
}