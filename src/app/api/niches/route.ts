import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    const niches = await db.getNiches();
    return NextResponse.json(niches);
}

export async function POST(req: Request) {
    try {
        const { name } = await req.json();
        if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

        const newNiche = await db.createNiche(name);
        return NextResponse.json(newNiche);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
