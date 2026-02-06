import type { DraftedPlayer } from "./draft";
import { MAX_PLAYERS_PER_TEAM } from "./draft";

const STORAGE_KEY_NAMES = "nba-draft-names";
const STORAGE_KEY_ORDER = "nba-draft-order";
const STORAGE_KEY_PICKS = "nba-draft-picks";

export function getNamesKey(teams: number): string {
  return `${STORAGE_KEY_NAMES}-${teams}`;
}

export function getOrderKey(teams: number): string {
  return `${STORAGE_KEY_ORDER}-${teams}`;
}

export function getPicksKey(teams: number): string {
  return `${STORAGE_KEY_PICKS}-${teams}`;
}

export function loadSavedNames(teams: number): Record<number, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(getNamesKey(teams));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    return Object.fromEntries(
      Object.entries(parsed).map(([k, v]) => [parseInt(k, 10), v]),
    );
  } catch {
    return {};
  }
}

export function saveNames(teams: number, names: Record<number, string>) {
  if (typeof window === "undefined") return;
  try {
    const keyed = Object.fromEntries(
      Object.entries(names).map(([k, v]) => [k, v]),
    );
    localStorage.setItem(getNamesKey(teams), JSON.stringify(keyed));
  } catch {
    // ignore
  }
}

export function loadSavedOrder(teams: number): number[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(getOrderKey(teams));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as number[];
    if (!Array.isArray(parsed) || parsed.length !== teams) return null;
    const expected = new Set(Array.from({ length: teams }, (_, i) => i + 1));
    if (new Set(parsed).size !== teams || parsed.some((n) => !expected.has(n)))
      return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveOrder(teams: number, order: number[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getOrderKey(teams), JSON.stringify(order));
  } catch {
    // ignore
  }
}

export function loadSavedPicks(
  teams: number,
): Record<number, DraftedPlayer[]> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(getPicksKey(teams));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return null;
    const result: Record<number, DraftedPlayer[]> = {};
    for (const [k, v] of Object.entries(parsed)) {
      const order = parseInt(k, 10);
      if (isNaN(order) || order < 1 || order > teams) continue;
      if (!Array.isArray(v)) continue;
      const list = v.filter(
        (item): item is DraftedPlayer =>
          item &&
          typeof item === "object" &&
          typeof (item as DraftedPlayer).id === "string" &&
          typeof (item as DraftedPlayer).name === "string" &&
          Array.isArray((item as DraftedPlayer).positions) &&
          typeof (item as DraftedPlayer).overall === "number",
      );
      if (list.length <= MAX_PLAYERS_PER_TEAM) result[order] = list;
    }
    return result;
  } catch {
    return null;
  }
}

export function savePicks(
  teams: number,
  picksByDrafter: Record<number, DraftedPlayer[]>,
) {
  if (typeof window === "undefined") return;
  try {
    const keyed = Object.fromEntries(
      Object.entries(picksByDrafter).map(([k, v]) => [k, v]),
    );
    localStorage.setItem(getPicksKey(teams), JSON.stringify(keyed));
  } catch {
    // ignore
  }
}

export function generateRandomOrder(teams: number): number[] {
  return Array.from({ length: teams }, (_, i) => i + 1).sort(
    () => Math.random() - 0.5,
  );
}
