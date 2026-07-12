import { NextResponse } from "next/server";
import { getLiveMarketQuotes } from "@/lib/market";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const quotes = await getLiveMarketQuotes();

    return NextResponse.json({
      quotes,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { quotes: [], updatedAt: new Date().toISOString() },
      { status: 500 },
    );
  }
}
