"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useDraftState } from "@/hooks/use-draft-state";
import { usePlayers } from "@/hooks/use-players";
import { DraftHeader } from "./draft-header";
import { DrafterColumn } from "./drafter-column";
import { PlayerPool } from "./player-pool";
import { getTeams, type ApiPlayer, type ApiTeam } from "@/lib/api";
import type { ApiTeamType } from "@/lib/team-type";
import {
  loadNbaPickTeams,
  saveNbaPickTeams,
  clearNbaPickTeams,
} from "@/lib/draft-storage";

export default function Draft({
  teams,
  nbaTeamRandom,
  teamType,
}: {
  teams: number;
  nbaTeamRandom: boolean;
  teamType: ApiTeamType;
}) {
  const [positionFilter, setPositionFilter] = useState("all");
  const [nbaTeams, setNbaTeams] = useState<ApiTeam[]>([]);
  const [nbaTeamsError, setNbaTeamsError] = useState<string | null>(null);
  const [nbaTeamsLoading, setNbaTeamsLoading] = useState(nbaTeamRandom);
  const [nbaFranchiseForPick, setNbaFranchiseForPick] = useState<string | null>(
    null,
  );

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
    draftedNames,
    isGameOver,
    canDraft,
    canUndo,
  } = useDraftState(teams);

  useEffect(() => {
    if (!nbaTeamRandom) {
      setNbaTeamsLoading(false);
      setNbaTeams([]);
      setNbaTeamsError(null);
      setNbaFranchiseForPick(null);
      return;
    }
    let cancelled = false;
    setNbaTeamsLoading(true);
    setNbaTeamsError(null);
    getTeams({ teamType })
      .then((list) => {
        if (cancelled) return;
        if (list.length === 0) {
          setNbaTeams([]);
          setNbaTeamsError("No NBA teams returned from the API.");
          return;
        }
        setNbaTeams(list);
      })
      .catch((e) => {
        if (!cancelled) {
          setNbaTeamsError(
            e instanceof Error ? e.message : "Failed to load NBA teams",
          );
          setNbaTeams([]);
        }
      })
      .finally(() => {
        if (!cancelled) setNbaTeamsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [nbaTeamRandom, teamType]);

  useEffect(() => {
    if (!nbaTeamRandom) {
      setNbaFranchiseForPick(null);
      return;
    }
    if (nbaTeams.length === 0) {
      setNbaFranchiseForPick(null);
      return;
    }
    if (isGameOver) {
      setNbaFranchiseForPick(null);
      return;
    }
    const saved = loadNbaPickTeams(teams);
    const existing = saved[currentPickIndex];
    if (existing) {
      setNbaFranchiseForPick(existing);
      return;
    }
    const cycleStart =
      Math.floor(currentPickIndex / nbaTeams.length) * nbaTeams.length;
    const usedInCycle = new Set<string>();
    for (let i = cycleStart; i < currentPickIndex; i++) {
      const t = saved[i];
      if (t) usedInCycle.add(t);
    }
    const pool = nbaTeams.filter((t) => !usedInCycle.has(t.teamName));
    const source = pool.length > 0 ? pool : nbaTeams;
    const choice = source[Math.floor(Math.random() * source.length)]!.teamName;
    saveNbaPickTeams(teams, { ...saved, [currentPickIndex]: choice });
    setNbaFranchiseForPick(choice);
  }, [nbaTeamRandom, nbaTeams, currentPickIndex, isGameOver, teams]);

  const skipPlayers = useMemo(
    () =>
      nbaTeamRandom &&
      (nbaTeamsLoading ||
        !!nbaTeamsError ||
        nbaTeams.length === 0 ||
        !nbaFranchiseForPick ||
        isGameOver),
    [
      nbaTeamRandom,
      nbaTeamsLoading,
      nbaTeamsError,
      nbaTeams.length,
      nbaFranchiseForPick,
      isGameOver,
    ],
  );

  const { players, loading: playersLoading, error: playersError } =
    usePlayers(positionFilter, {
      team: nbaTeamRandom ? (nbaFranchiseForPick ?? undefined) : undefined,
      skip: skipPlayers,
      teamType,
    });

  const poolError = nbaTeamsError ?? playersError;
  const poolLoading =
    nbaTeamRandom &&
    (nbaTeamsLoading ||
      (!nbaTeamsError &&
        nbaTeams.length > 0 &&
        !isGameOver &&
        nbaFranchiseForPick == null)) &&
    !isGameOver
      ? true
      : !skipPlayers && playersLoading;

  const availablePlayers = useMemo(() => {
    const seenIds = new Set<string>();
    const seenNames = new Set<string>();
    const out: ApiPlayer[] = [];
    for (const p of players) {
      const lowerName = p.name.toLowerCase();
      if (draftedIds.has(p._id)) continue;
      if (draftedNames.has(lowerName)) continue;
      if (seenIds.has(p._id)) continue;
      if (seenNames.has(lowerName)) continue;
      seenIds.add(p._id);
      seenNames.add(lowerName);
      out.push(p);
    }
    return out;
  }, [players, draftedIds, draftedNames]);

  const clearRandomTeams = useCallback(() => {
    clearNbaPickTeams(teams);
  }, [teams]);

  const onResetOrder = useCallback(() => {
    clearRandomTeams();
    handleReset();
  }, [clearRandomTeams, handleReset]);

  const onResetAll = useCallback(() => {
    clearRandomTeams();
    handleResetAll();
  }, [clearRandomTeams, handleResetAll]);

  return (
    <div className="min-h-screen p-4 flex flex-col gap-6">
      <DraftHeader
        currentDrafterOrder={currentDrafterOrder}
        currentPickIndex={currentPickIndex}
        drafters={state.drafters}
        isGameOver={isGameOver}
        onResetOrder={onResetOrder}
        onResetAll={onResetAll}
        onUndoPick={handleUndoPick}
        canUndo={canUndo}
        nbaFranchiseForPick={
          nbaTeamRandom && !isGameOver ? nbaFranchiseForPick : null
        }
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
        loading={poolLoading}
        error={poolError}
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
