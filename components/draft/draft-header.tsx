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
}

export function DraftHeader({
  currentDrafterOrder,
  currentPickIndex,
  drafters,
  isGameOver,
  onResetOrder,
  onResetAll,
}: DraftHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">Draft Board</h1>
        <Button variant="outline" size="sm" onClick={onResetOrder}>
          Reset order
        </Button>
        <Button variant="outline" size="sm" onClick={onResetAll}>
          Reset all
        </Button>
        {currentDrafterOrder != null && !isGameOver && (
          <span className="text-sm text-muted-foreground">
            Pick #{currentPickIndex + 1} ·{" "}
            {drafters.find((d) => d.draftOrder === currentDrafterOrder)?.name ??
              `Team ${currentDrafterOrder}`}{" "}
            is on the clock
          </span>
        )}
      </div>

      {isGameOver && (
        <div className="rounded-lg border border-primary bg-primary/10 px-4 py-3 text-center font-semibold text-primary">
          Draft complete — all teams have {MAX_PLAYERS_PER_TEAM} players.
        </div>
      )}
    </>
  );
}
