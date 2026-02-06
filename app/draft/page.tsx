import Draft from "@/components/draft";
import { redirect } from "next/navigation";

export default async function DraftPage({
  searchParams,
}: {
  searchParams: Promise<{ teams: string }>;
}) {
  const teams = parseInt((await searchParams).teams);

  if (isNaN(teams)) {
    return redirect("/");
  }

  return <Draft teams={teams} />;
}
