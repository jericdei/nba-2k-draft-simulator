"use client";

import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  startTransition,
} from "react";
import type { ApiPlayer } from "@/lib/api";
import {
  type DraftState,
  type DraftedPlayer,
  MAX_PLAYERS_PER_TEAM,
  getDrafterOrderAtPick,
} from "@/lib/draft";
import {
  loadSavedOrder,
  saveOrder,
  loadSavedNames,
  saveNames,
  loadSavedPicks,
  savePicks,
  generateRandomOrder,
} from "@/lib/draft-storage";

export function useDraftState(teams: number) {
  const [state, setState] = useState<DraftState>({
    drafters: [],
    picksByDrafter: {},
  });

  const persistName = useCallback(
    (order: number, name: string) => {
      const saved = loadSavedNames(teams);
      saved[order] = name;
      saveNames(teams, saved);
    },
    [teams],
  );

  useEffect(() => {
    const order =
      loadSavedOrder(teams) ??
      (() => {
        const newOrder = generateRandomOrder(teams);
        saveOrder(teams, newOrder);
        return newOrder;
      })();
    const saved = loadSavedNames(teams);
    const savedPicks = loadSavedPicks(teams);
    const emptyPicks = Object.fromEntries(order.map((o) => [o, []]));
    const picksByDrafter =
      savedPicks && Object.keys(savedPicks).length > 0
        ? { ...emptyPicks, ...savedPicks }
        : emptyPicks;
    const next: DraftState = {
      drafters: order.map((o) => ({
        name: saved[o] ?? `Team ${o}`,
        draftOrder: o,
      })),
      picksByDrafter,
    };
    startTransition(() => setState(next));
  }, [teams]);

  useEffect(() => {
    if (state.drafters.length === 0) return;
    savePicks(teams, state.picksByDrafter);
  }, [teams, state.drafters.length, state.picksByDrafter]);

  const handleReset = useCallback(() => {
    const newOrder = generateRandomOrder(teams);
    saveOrder(teams, newOrder);
    const saved = loadSavedNames(teams);
    const emptyPicks = Object.fromEntries(newOrder.map((o) => [o, []]));
    savePicks(teams, emptyPicks);
    startTransition(() =>
      setState({
        drafters: newOrder.map((o) => ({
          name: saved[o] ?? `Team ${o}`,
          draftOrder: o,
        })),
        picksByDrafter: emptyPicks,
      }),
    );
  }, [teams]);

  const handleResetAll = useCallback(() => {
    const newOrder = generateRandomOrder(teams);
    saveOrder(teams, newOrder);
    saveNames(teams, {});
    const emptyPicks = Object.fromEntries(newOrder.map((o) => [o, []]));
    savePicks(teams, emptyPicks);
    startTransition(() =>
      setState({
        drafters: newOrder.map((o) => ({
          name: `Team ${o}`,
          draftOrder: o,
        })),
        picksByDrafter: emptyPicks,
      }),
    );
  }, [teams]);

  const handleNameChange = useCallback(
    (draftOrder: number, name: string) => {
      setState((prev) => ({
        ...prev,
        drafters: prev.drafters.map((d) =>
          d.draftOrder === draftOrder ? { ...d, name } : d,
        ),
      }));
      persistName(draftOrder, name);
    },
    [persistName],
  );

  const pickOrder = useMemo(
    () => state.drafters.map((d) => d.draftOrder),
    [state.drafters],
  );
  const totalPicks = useMemo(
    () =>
      state.drafters.reduce(
        (sum, d) => sum + (state.picksByDrafter[d.draftOrder]?.length ?? 0),
        0,
      ),
    [state.drafters, state.picksByDrafter],
  );
  const currentPickIndex = totalPicks;
  const currentDrafterOrder =
    pickOrder.length > 0
      ? getDrafterOrderAtPick(currentPickIndex, pickOrder)
      : null;
  const draftedIds = useMemo(
    () =>
      new Set(
        state.drafters.flatMap((d) =>
          (state.picksByDrafter[d.draftOrder] ?? []).map((p) => p.id),
        ),
      ),
    [state.drafters, state.picksByDrafter],
  );
  const isGameOver =
    state.drafters.length > 0 &&
    state.drafters.every(
      (d) =>
        (state.picksByDrafter[d.draftOrder]?.length ?? 0) >=
        MAX_PLAYERS_PER_TEAM,
    );
  const currentTeamSize =
    currentDrafterOrder != null
      ? (state.picksByDrafter[currentDrafterOrder]?.length ?? 0)
      : 0;
  const canDraft =
    !isGameOver &&
    currentDrafterOrder != null &&
    currentTeamSize < MAX_PLAYERS_PER_TEAM;

  const handleDraft = useCallback(
    (player: ApiPlayer) => {
      if (!canDraft || draftedIds.has(player._id)) return;
      const drafterOrder = currentDrafterOrder!;
      const drafted: DraftedPlayer = {
        id: player._id,
        name: player.name,
        positions: player.positions ?? [],
        overall: player.overall,
      };
      setState((prev) => ({
        ...prev,
        picksByDrafter: {
          ...prev.picksByDrafter,
          [drafterOrder]: [
            ...(prev.picksByDrafter[drafterOrder] ?? []),
            drafted,
          ],
        },
      }));
    },
    [canDraft, currentDrafterOrder, draftedIds],
  );

  return {
    state,
    handleReset,
    handleResetAll,
    handleNameChange,
    handleDraft,
    pickOrder,
    currentPickIndex,
    currentDrafterOrder,
    draftedIds,
    isGameOver,
    canDraft,
  };
}
