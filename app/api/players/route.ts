import { NextResponse } from "next/server";

const POSITIONS = ["PG", "SG", "SF", "PF", "C"] as const;

export async function GET(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL;
  const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? process.env.API_KEY;

  if (!baseUrl || !apiKey) {
    return NextResponse.json({ error: "API not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const position = searchParams.get("position");
  const positionParam =
    position && POSITIONS.includes(position as (typeof POSITIONS)[number])
      ? `&position=${encodeURIComponent(position)}`
      : "";

  const playersUrl = `${baseUrl}/players?limit=100${positionParam}`;
  const fetchOptions: RequestInit = {
    headers: { "X-API-Key": apiKey },
    next: { revalidate: 60 },
  };
  const response = await fetch(playersUrl, fetchOptions);

  if (!response.ok) {
    const text = await response.text();
    return NextResponse.json(
      { error: "Failed to fetch players", details: text },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data.data ?? []);
}
