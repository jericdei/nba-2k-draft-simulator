/** Upstream API `teamType` query values for players/teams. */
export const API_TEAM_TYPES = ["allt", "curr"] as const;
export type ApiTeamType = (typeof API_TEAM_TYPES)[number];

export function parseApiTeamType(
  value: string | null | undefined,
): ApiTeamType {
  return value === "curr" ? "curr" : "allt";
}
