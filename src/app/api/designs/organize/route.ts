import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (type === "duplicates") {
        const allDesigns = db.getDesigns();
        const allNiches = db.getNiches();

        // Filter helper
        const duplicates = allDesigns
            .filter(d => d.nicheIds.length > 1)
            .map(d => ({
                ...d,
                niches: d.nicheIds.map(nid => ({
                    niche: { name: allNiches.find(n => n.id === nid)?.name || "Unknown" }
                }))
            }));

        return NextResponse.json(duplicates);
    }

    // Default to unassigned
    const unassigned = db.getUnassignedDesigns();
    return NextResponse.json(unassigned);
}
