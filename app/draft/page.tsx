import Draft from "@/components/draft";
import { redirect } from "next/navigation";
import { parseApiTeamType } from "@/lib/team-type";

export default async function DraftPage({
  searchParams,
}: {
  searchParams: Promise<{
    teams?: string;
    nbaTeamRandom?: string;
    teamType?: string;
  }>;
}) {
  const params = await searchParams;
  const teams = parseInt(params.teams ?? "", 10);
  const nbaTeamRandom =
    params.nbaTeamRandom === "1" || params.nbaTeamRandom === "true";
  const teamType = parseApiTeamType(params.teamType);

  if (isNaN(teams)) {
    return redirect("/");
  }

  return (
    <Draft teams={teams} nbaTeamRandom={nbaTeamRandom} teamType={teamType} />
  );
}
