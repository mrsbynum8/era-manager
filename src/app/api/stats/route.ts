import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    const designs = await db.getDesigns();
    const niches = await db.getNiches();
    const unassigned = await db.getUnassignedDesigns();

    return NextResponse.json({
        totalDesigns: designs.length,
        totalNiches: niches.length,
        unassigned: unassigned.length
    });
}
