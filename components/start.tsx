"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  generateRandomOrder,
  saveNames,
  saveOrder,
  savePicks,
  clearNbaPickTeams,
} from "@/lib/draft-storage";
import type { ApiTeamType } from "@/lib/team-type";
import { cn } from "@/lib/utils";

const TEAM_OPTIONS = [2, 3, 4, 5, 6] as const;

const ROSTER_TYPE_OPTIONS: { value: ApiTeamType; label: string }[] = [
  { value: "allt", label: "All-time" },
  { value: "curr", label: "Current" },
];

export default function StartPage() {
  const [teams, setTeams] = useState(2);
  const [teamType, setTeamType] = useState<ApiTeamType>("allt");
  const [nbaTeamRandom, setNbaTeamRandom] = useState(false);
  const [names, setNames] = useState<string[]>(
    Array.from({ length: 2 }, () => ""),
  );
  const router = useRouter();

  const handleStart = () => {
    const trimmed = names.map((name) => name.trim());
    if (trimmed.some((name) => name.length === 0)) {
      toast.error("Please enter a name for every team");
      return;
    }

    const order = generateRandomOrder(teams);
    const keyedNames = Object.fromEntries(
      trimmed.map((name, index) => [index + 1, name]),
    );
    const emptyPicks = Object.fromEntries(
      Array.from({ length: teams }, (_, i) => [i + 1, []]),
    );
    saveNames(teams, keyedNames);
    saveOrder(teams, order);
    savePicks(teams, emptyPicks);
    clearNbaPickTeams(teams);
    const qs = new URLSearchParams({ teams: String(teams) });
    qs.set("teamType", teamType);
    if (nbaTeamRandom) qs.set("nbaTeamRandom", "1");
    router.push(`/draft?${qs.toString()}`);
  };

  const handleTeamSelect = (count: number) => {
    setTeams(count);
    setNames(Array.from({ length: count }, () => ""));
    saveNames(count, {});
  };

  const handleNameChange = (index: number, value: string) => {
    setNames((prev) => {
      const next = [...prev];
      next[index] = value;
      const keyedNames = Object.fromEntries(
        next.map((name, idx) => [idx + 1, name.trim()]),
      );
      saveNames(teams, keyedNames);
      return next;
    });
  };

  return (
    <div className="min-h-svh bg-muted/35 flex flex-col">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10 lg:max-w-4xl">
        <header className="mb-6 shrink-0 text-center sm:mb-8">
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-[2.25rem] md:leading-tight">
            NBA2K Draft Simulator
          </h1>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm sm:text-base">
            Choose roster type and team count, name your squads, then start.
          </p>
        </header>

        <Card className="border-border/80 shadow-sm flex flex-1 flex-col md:flex-initial">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-base sm:text-lg">Draft setup</CardTitle>
            <CardDescription>
              League scope, headcount, then name each drafter.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col gap-8 pt-6 md:grid md:min-h-[min(24rem,calc(100dvh-12rem))] md:grid-cols-[11.5rem_minmax(0,1fr)] md:grid-rows-[auto_auto_auto_1fr] md:gap-x-10 md:gap-y-5">
            {/* Teams count */}
            <section className="space-y-2 md:col-start-1 md:row-start-1">
              <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Teams
              </h2>
              <div className="grid grid-cols-5 gap-2">
                {TEAM_OPTIONS.map((option) => {
                  const isActive = teams === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleTeamSelect(option)}
                      className={cn(
                        "flex aspect-square max-h-[3.25rem] items-center justify-center rounded-md border text-xl font-semibold transition-colors sm:max-h-14 sm:text-2xl",
                        isActive
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-input hover:bg-secondary",
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Roster type */}
            <section className="space-y-2 md:col-start-1 md:row-start-2">
              <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Player roster
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {ROSTER_TYPE_OPTIONS.map((opt) => {
                  const isActive = teamType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTeamType(opt.value)}
                      className={cn(
                        "rounded-md border py-2.5 text-sm font-semibold transition-colors sm:py-3 sm:text-base",
                        isActive
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-input hover:bg-secondary",
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-muted-foreground text-[11px] leading-snug sm:text-xs">
                All-time includes historic rosters; current is active NBA only.
              </p>
            </section>

            {/* Randomizer */}
            <section className="md:col-start-1 md:row-start-3">
              <Label className="text-foreground hover:bg-muted/50 -m-2 flex cursor-pointer items-start gap-3 rounded-md p-2 text-left text-sm leading-snug font-normal sm:items-center">
                <input
                  type="checkbox"
                  checked={nbaTeamRandom}
                  onChange={(e) => setNbaTeamRandom(e.target.checked)}
                  className="border-input accent-primary mt-0.5 size-4 shrink-0 rounded sm:mt-0 sm:size-5"
                />
                <span>
                  <span className="font-medium">NBA team randomizer</span>
                  <span className="text-muted-foreground block text-xs sm:inline sm:before:content-['—'] sm:before:mx-1">
                    {" "}
                    Each pick locks the pool to one random franchise.
                  </span>
                </span>
              </Label>
            </section>

            {/* Team names — scroll on small / many teams */}
            <section className="flex min-h-0 flex-col gap-2 md:col-start-2 md:row-span-4 md:row-start-1 md:h-full">
              <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Team names ({teams})
              </h2>
              <div className="border-border/80 bg-background/80 flex max-h-[min(42svh,22rem)] flex-col gap-2 overflow-y-auto rounded-lg border p-3 md:max-h-none md:min-h-0 md:flex-1">
                {names.map((name, index) => (
                  <Input
                    key={`team-name-${index}`}
                    value={name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    placeholder={`Team ${index + 1}`}
                    className="h-11 shrink-0 text-base sm:h-12"
                  />
                ))}
              </div>
            </section>
          </CardContent>

          <CardFooter className="border-t mt-auto">
            <Button
              className="h-12 w-full text-base font-semibold sm:h-14 sm:text-lg"
              onClick={handleStart}
            >
              Start draft
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
