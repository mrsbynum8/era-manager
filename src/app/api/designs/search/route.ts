import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const excludeNiche = searchParams.get("excludeNiche") || undefined;

    if (!q || q.length < 2) return NextResponse.json([]);

    const designs = await db.searchDesigns(q, excludeNiche);
    return NextResponse.json(designs);
}
