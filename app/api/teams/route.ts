import { NextResponse } from "next/server";
import { parseApiTeamType } from "@/lib/team-type";

export async function GET(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL;
  const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? process.env.API_KEY;

  if (!baseUrl || !apiKey) {
    return NextResponse.json({ error: "API not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const teamType = parseApiTeamType(searchParams.get("teamType"));
  const teamsUrl = `${baseUrl}/teams?teamType=${teamType}`;
  const response = await fetch(teamsUrl, {
    headers: { "X-API-Key": apiKey },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    const text = await response.text();
    return NextResponse.json(
      { error: "Failed to fetch teams", details: text },
      { status: response.status },
    );
  }

  const data = await response.json();
  const list = data.data ?? data;
  return NextResponse.json(Array.isArray(list) ? list : []);
}
