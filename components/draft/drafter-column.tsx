"use client";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MAX_PLAYERS_PER_TEAM } from "@/lib/draft";
import type { Drafter, DraftedPlayer } from "@/lib/draft";

interface DrafterColumnProps {
  drafter: Drafter;
  picks: DraftedPlayer[];
  isCurrent: boolean;
  onNameChange: (draftOrder: number, name: string) => void;
}

export function DrafterColumn({
  drafter,
  picks,
  isCurrent,
  onNameChange,
}: DrafterColumnProps) {
  const count = picks.length;

  return (
    <Card
      className={`flex flex-col min-h-[280px] transition-shadow ${isCurrent ? "ring-2 ring-primary shadow-md" : ""}`}
    >
      <CardHeader className="pb-2 space-y-1">
        <div className="text-xs text-muted-foreground font-medium flex justify-between items-center">
          <span>Pick #{drafter.draftOrder}</span>
          <span>
            {count}/{MAX_PLAYERS_PER_TEAM}
          </span>
        </div>
        <Input
          className="font-semibold text-sm"
          placeholder={`Team ${drafter.draftOrder}`}
          value={drafter.name}
          onChange={(e) => onNameChange(drafter.draftOrder, e.target.value)}
        />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 pt-0">
        <div className="text-xs text-muted-foreground mb-1">Picks</div>
        <div className="flex-1 min-h-[140px] rounded border border-border bg-muted/30 p-2 overflow-y-auto">
          {picks.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No picks yet
            </p>
          ) : (
            <ul className="space-y-1">
              {picks.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-2 text-xs py-1.5 px-2 rounded bg-background border"
                >
                  <Badge
                    variant="secondary"
                    className="shrink-0 font-semibold tabular-nums"
                  >
                    {p.overall}
                  </Badge>
                  <span className="font-medium truncate min-w-0">{p.name}</span>
                  <span className="text-muted-foreground shrink-0">
                    {p.positions.join("/")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
