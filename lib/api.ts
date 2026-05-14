import type { ApiTeamType } from "./team-type";

export interface ApiPlayer {
  _id: string;
  name: string;
  overall: number;
  positions: string[];
  team?: string;
  slug?: string;
  playerImage?: string;
  teamImg?: string;
  [key: string]: unknown;
}

export interface ApiTeam {
  teamName: string;
  [key: string]: unknown;
}

/** Fetch NBA teams via our API route (avoids CORS by proxying server-side). */
export async function getTeams(options?: {
  teamType?: ApiTeamType;
}): Promise<ApiTeam[]> {
  const params = new URLSearchParams();
  params.set("teamType", options?.teamType ?? "allt");
  const response = await fetch(`/api/teams?${params.toString()}`);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error ?? "Failed to fetch teams",
    );
  }

  const data = await response.json();
  if (!Array.isArray(data)) return [];
  return data.filter(
    (item): item is ApiTeam =>
      item != null &&
      typeof item === "object" &&
      typeof (item as ApiTeam).teamName === "string" &&
      (item as ApiTeam).teamName.trim() !== "",
  );
}

/** Fetch players via our API route (avoids CORS by proxying server-side). */
export async function getPlayers(options?: {
  position?: string;
  team?: string;
  teamType?: ApiTeamType;
}): Promise<ApiPlayer[]> {
  const params = new URLSearchParams();
  params.set("teamType", options?.teamType ?? "allt");
  if (options?.position) params.set("position", options.position);
  if (options?.team?.trim()) params.set("team", options.team.trim());
  const qs = params.toString();
  const url = `/api/players?${qs}`;
  const response = await fetch(url);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error ?? "Failed to fetch players",
    );
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}
