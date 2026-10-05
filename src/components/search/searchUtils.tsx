import type { ReactNode } from "react";

const RECENT_KEY = "lumora:recent-searches";
const RECENT_MAX = 5;

/** Recent searches live in localStorage (per-browser convenience only); every
 * access is guarded so private mode / blocked storage just means "no recents". */
export function readRecentSearches(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const list: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(list)
      ? list.filter((v): v is string => typeof v === "string").slice(0, RECENT_MAX)
      : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(query: string): void {
  const q = query.trim();
  if (!q) return;
  try {
    const next = [
      q,
      ...readRecentSearches().filter((v) => v.toLowerCase() !== q.toLowerCase()),
    ].slice(0, RECENT_MAX);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — recents are optional */
  }
}

export function clearRecentSearches(): void {
  try {
    window.localStorage.removeItem(RECENT_KEY);
  } catch {
    /* ignore */
  }
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Wraps every query word found in `text` in a neon-tinted mark. */
export function highlightMatches(text: string, query: string): ReactNode {
  const terms = query.trim().split(/\s+/).filter(Boolean).map(escapeRegExp);
  if (!terms.length || !text) return text;
  const parts = text.split(new RegExp(`(${terms.join("|")})`, "gi"));
  const lowered = new Set(terms.map((t) => t.toLowerCase().replace(/\\/g, "")));
  return parts.map((part, i) =>
    lowered.has(part.toLowerCase()) ? (
      <mark
        key={i}
        className="rounded-[3px] bg-[#c2ffb6] px-0.5 text-foreground"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
