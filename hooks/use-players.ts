"use client";

import { useEffect, useState, startTransition } from "react";
import { getPlayers, type ApiPlayer } from "@/lib/api";
import type { ApiTeamType } from "@/lib/team-type";

export function usePlayers(
  positionFilter: string,
  options?: { team?: string; skip?: boolean; teamType?: ApiTeamType },
) {
  const team = options?.team?.trim() ?? undefined;
  const skip = options?.skip === true;
  const teamType = options?.teamType ?? "allt";

  const [players, setPlayers] = useState<ApiPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (skip) {
      startTransition(() => {
        setLoading(true);
        setError(null);
        setPlayers([]);
      });
      return;
    }

    let cancelled = false;
    getPlayers({
      position: positionFilter === "all" ? undefined : positionFilter,
      team,
      teamType,
    })
      .then((data) => {
        if (!cancelled) {
          setPlayers(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load players",
          );
          setPlayers([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    startTransition(() => {
      setLoading(true);
      setError(null);
    });
    return () => {
      cancelled = true;
    };
  }, [positionFilter, team, skip, teamType]);

  return { players, loading, error };
}
