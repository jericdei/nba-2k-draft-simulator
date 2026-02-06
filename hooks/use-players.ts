"use client";

import { useEffect, useState, startTransition } from "react";
import { getPlayers, type ApiPlayer } from "@/lib/api";

export function usePlayers(positionFilter: string) {
  const [players, setPlayers] = useState<ApiPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getPlayers({
      position: positionFilter === "all" ? undefined : positionFilter,
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
  }, [positionFilter]);

  return { players, loading, error };
}
