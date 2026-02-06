"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function StartPage() {
  const [teams, setTeams] = useState(0);
  const router = useRouter();

  const handleTeamsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    if (value === "") {
      setTeams(0);
      return;
    }

    const parsedValue = parseInt(value);

    if (isNaN(parsedValue)) {
      setTeams(0);
    }

    setTeams(parsedValue);
  };

  const handleStart = () => {
    if (teams < 2) {
      toast.error("Please enter a number greater than 1");
      return;
    }

    router.push(`/draft?teams=${teams}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 p-4">
      <h1 className="text-4xl font-bold">NBA2K Draft Simulator</h1>

      <Input
        className="w-1/2 text-2xl"
        type="number"
        placeholder="How many teams are in the draft?"
        value={teams}
        onChange={handleTeamsChange}
      />

      <Button className="w-1/2" onClick={handleStart}>
        Let&apos;s Go!
      </Button>
    </div>
  );
}
