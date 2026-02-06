"use client";

import { Button } from "@/components/ui/button";
import { MAX_PLAYERS_PER_TEAM } from "@/lib/draft";
import type { Drafter } from "@/lib/draft";

interface DraftHeaderProps {
  currentDrafterOrder: number | null;
  currentPickIndex: number;
  drafters: Drafter[];
  isGameOver: boolean;
  onResetOrder: () => void;
  onResetAll: () => void;
  onUndoPick: () => void;
  canUndo: boolean;
}

export function DraftHeader({
  currentDrafterOrder,
  currentPickIndex,
  drafters,
  isGameOver,
  onResetOrder,
  onResetAll,
  onUndoPick,
  canUndo,
}: DraftHeaderProps) {
  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Draft Board</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onUndoPick}
            disabled={!canUndo}
          >
            Undo pick
          </Button>
          <Button variant="outline" size="sm" onClick={onResetOrder}>
            Reset order
          </Button>
          <Button variant="outline" size="sm" onClick={onResetAll}>
            Reset all
          </Button>
        </div>
      </div>

      {currentDrafterOrder != null && !isGameOver && (
        <div className="text-center text-sm text-muted-foreground sm:text-left">
          Pick #{currentPickIndex + 1} ·{" "}
          {drafters.find((d) => d.draftOrder === currentDrafterOrder)?.name ??
            `Team ${currentDrafterOrder}`}{" "}
          is on the clock
        </div>
      )}

      {isGameOver && (
        <div className="rounded-lg border border-primary bg-primary/10 px-4 py-3 text-center font-semibold text-primary">
          Draft complete — all teams have {MAX_PLAYERS_PER_TEAM} players.
        </div>
      )}
    </>
  );
}
