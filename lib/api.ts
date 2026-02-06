export interface ApiPlayer {
  _id: string;
  name: string;
  overall: number;
  positions: string[];
  team?: string;
  slug?: string;
  [key: string]: unknown;
}

/** Fetch players via our API route (avoids CORS by proxying server-side). */
export async function getPlayers(options?: {
  position?: string;
}): Promise<ApiPlayer[]> {
  const params = new URLSearchParams();
  if (options?.position) params.set("position", options.position);
  const qs = params.toString();
  const url = qs ? `/api/players?${qs}` : "/api/players";
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
