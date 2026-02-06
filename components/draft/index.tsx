"use client";

import { useState, useMemo } from "react";
import { useDraftState } from "@/hooks/use-draft-state";
import { usePlayers } from "@/hooks/use-players";
import { DraftHeader } from "./draft-header";
import { DrafterColumn } from "./drafter-column";
import { PlayerPool } from "./player-pool";

export default function Draft({ teams }: { teams: number }) {
  const [positionFilter, setPositionFilter] = useState("all");

  const {
    state,
    handleReset,
    handleResetAll,
    handleNameChange,
    handleDraft,
    handleUndoPick,
    currentPickIndex,
    currentDrafterOrder,
    draftedIds,
    isGameOver,
    canDraft,
    canUndo,
  } = useDraftState(teams);

  const { players, loading, error } = usePlayers(positionFilter);

  const availablePlayers = useMemo(
    () => players.filter((p) => !draftedIds.has(p._id)),
    [players, draftedIds],
  );

  return (
    <div className="min-h-screen p-4 flex flex-col gap-6">
      <DraftHeader
        currentDrafterOrder={currentDrafterOrder}
        currentPickIndex={currentPickIndex}
        drafters={state.drafters}
        isGameOver={isGameOver}
        onResetOrder={handleReset}
        onResetAll={handleResetAll}
        onUndoPick={handleUndoPick}
        canUndo={canUndo}
      />

      <div
        className="grid gap-4 flex-1 min-h-0"
        style={{ gridTemplateColumns: `repeat(${teams}, minmax(0, 1fr))` }}
      >
        {state.drafters.map((drafter) => (
          <DrafterColumn
            key={drafter.draftOrder}
            drafter={drafter}
            picks={state.picksByDrafter[drafter.draftOrder] ?? []}
            isCurrent={
              drafter.draftOrder === currentDrafterOrder && !isGameOver
            }
            onNameChange={handleNameChange}
          />
        ))}
      </div>

      <PlayerPool
        players={availablePlayers}
        loading={loading}
        error={error}
        positionFilter={positionFilter}
        onPositionChange={setPositionFilter}
        availableCount={availablePlayers.length}
        isGameOver={isGameOver}
        canDraft={canDraft}
        onDraft={handleDraft}
      />
    </div>
  );
}
