"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ApiPlayer } from "@/lib/api";

const POSITION_OPTIONS = [
  { value: "all", label: "All" },
  { value: "PG", label: "PG" },
  { value: "SG", label: "SG" },
  { value: "SF", label: "SF" },
  { value: "PF", label: "PF" },
  { value: "C", label: "C" },
];

interface PlayerPoolProps {
  players: ApiPlayer[];
  loading: boolean;
  error: string | null;
  positionFilter: string;
  onPositionChange: (value: string) => void;
  availableCount: number;
  isGameOver: boolean;
  canDraft: boolean;
  onDraft: (player: ApiPlayer) => void;
}

export function PlayerPool({
  players,
  loading,
  error,
  positionFilter,
  onPositionChange,
  availableCount,
  isGameOver,
  canDraft,
  onDraft,
}: PlayerPoolProps) {
  const subtitle = loading
    ? "Loading players…"
    : error
      ? error
      : isGameOver
        ? "Draft complete"
        : `${availableCount} available · Click a player to draft`;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold">Player pool</div>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {POSITION_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              type="button"
              variant={positionFilter === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => onPositionChange(opt.value)}
              disabled={loading}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] rounded border border-border bg-muted/20 p-3 flex flex-col">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center flex-1 flex items-center justify-center">
              Loading players…
            </p>
          ) : error ? (
            <p className="text-sm text-destructive text-center flex-1 flex items-center justify-center">
              {error}
            </p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 h-full min-h-0 overflow-y-auto">
              {players.map((player) => (
                <li key={player._id}>
                  <button
                    type="button"
                    onClick={() => onDraft(player)}
                    disabled={!canDraft}
                    className="w-full cursor-pointer flex items-center gap-2 py-2 px-3 rounded border border-border bg-background text-sm text-left transition-colors hover:bg-muted hover:border-primary/50 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed"
                  >
                    <Badge
                      variant="secondary"
                      className="shrink-0 font-semibold tabular-nums"
                    >
                      {player.overall}
                    </Badge>
                    <span className="font-medium truncate min-w-0 flex-1">
                      {player.name}
                    </span>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {player.positions?.join("/") ?? "—"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
