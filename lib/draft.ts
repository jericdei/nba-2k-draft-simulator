export const MAX_PLAYERS_PER_TEAM = 12;

export interface Drafter {
  name: string;
  draftOrder: number;
}

export interface DraftedPlayer {
  id: string;
  name: string;
  positions: string[];
  overall: number;
}

export type DraftState = {
  drafters: Drafter[];
  picksByDrafter: Record<number, DraftedPlayer[]>;
};

/** Serpentine: who picks at global 0-based pick index (round 0: 0,1..n-1; round 1: n-1..0; etc). */
export function getDrafterOrderAtPick(
  pickIndex: number,
  pickOrder: number[],
): number {
  const teams = pickOrder.length;
  const round = Math.floor(pickIndex / teams);
  const pos = pickIndex % teams;
  return round % 2 === 0 ? pickOrder[pos]! : pickOrder[teams - 1 - pos]!;
}
