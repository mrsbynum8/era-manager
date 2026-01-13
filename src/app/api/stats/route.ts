import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    const designs = db.getDesigns();
    const niches = db.getNiches();
    const unassigned = db.getUnassignedDesigns();

    // Calculate coverage
    const assignedCount = designs.length - unassigned.length;
    const coveragePercent = designs.length > 0 ? Math.round((assignedCount / designs.length) * 100) : 0;

    // Get top 3 niches by design count
    const topNiches = niches
        .sort((a, b) => b._count.designs - a._count.designs)
        .slice(0, 3)
        .map(n => ({ id: n.id, name: n.name, count: n._count.designs }));

    // Get all niches for distribution chart
    const nicheDistribution = niches
        .sort((a, b) => b._count.designs - a._count.designs)
        .map(n => ({
            id: n.id,
            name: n.name,
            count: n._count.designs,
            percentage: designs.length > 0 ? Math.round((n._count.designs / designs.length) * 100) : 0
        }));

    return NextResponse.json({
        totalDesigns: designs.length,
        totalNiches: niches.length,
        unassignedCount: unassigned.length,
        assignedCount,
        coveragePercent,
        topNiches,
        nicheDistribution
    });
}
