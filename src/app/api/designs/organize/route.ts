import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (type === "duplicates") {
        const duplicates = await db.getDuplicateDesigns();

        // Map to match frontend expectation: niches: { niche: { name } }[]
        // db.getDuplicateDesigns returns designs with `niches: Niche[]`
        const mapped = duplicates.map((d: any) => ({
            ...d,
            niches: d.niches.map((n: any) => ({
                niche: { name: n.name }
            }))
        }));

        return NextResponse.json(mapped);
    }

    // Default to unassigned
    const unassigned = await db.getUnassignedDesigns();
    return NextResponse.json(unassigned);
}
