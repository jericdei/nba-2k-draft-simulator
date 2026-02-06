"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  generateRandomOrder,
  saveNames,
  saveOrder,
  savePicks,
} from "@/lib/draft-storage";

const TEAM_OPTIONS = [2, 3, 4, 5, 6] as const;

export default function StartPage() {
  const [teams, setTeams] = useState(2);
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
    router.push(`/draft?teams=${teams}`);
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
    <div className="flex flex-col items-center justify-center h-screen gap-6 p-6">
      <h1 className="text-5xl font-bold">NBA2K Draft Simulator</h1>
      <div className="w-2/3 max-w-xl">
        <p className="text-center text-xl text-muted-foreground mb-3">
          How many teams are in the draft?
        </p>
        <div className="grid grid-cols-5 gap-3">
          {TEAM_OPTIONS.map((option) => {
            const isActive = teams === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleTeamSelect(option)}
                className={`h-16 text-3xl font-semibold border transition-colors cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-input hover:bg-secondary"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-2/3 max-w-xl">
        <p className="text-center text-xl text-muted-foreground mb-3">
          Enter team names
        </p>
        <div className="grid gap-3">
          {names.map((name, index) => (
            <Input
              key={`team-name-${index}`}
              value={name}
              onChange={(e) => handleNameChange(index, e.target.value)}
              placeholder={`Team ${index + 1}`}
              className="h-14 text-xl"
            />
          ))}
        </div>
      </div>

      <Button className="w-2/3 max-w-xl h-16 text-2xl" onClick={handleStart}>
        Start Draft
      </Button>
    </div>
  );
}
