import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    const designs = await db.getDesigns();
    const niches = await db.getNiches();
    const unassigned = await db.getUnassignedDesigns();

    // Calculate coverage
    const assignedCount = designs.length - unassigned.length;
    const coveragePercent = designs.length > 0 ? Math.round((assignedCount / designs.length) * 100) : 0;

    // Get top 3 niches by design count
    const topNiches = niches
        .sort((a: any, b: any) => (b._count?.designs || 0) - (a._count?.designs || 0))
        .slice(0, 3)
        .map((n: any) => ({ id: n.id, name: n.name, count: n._count?.designs || 0 }));

    // Get all niches for distribution chart
    const nicheDistribution = niches
        .sort((a: any, b: any) => (b._count?.designs || 0) - (a._count?.designs || 0))
        .map((n: any) => ({
            id: n.id,
            name: n.name,
            count: n._count?.designs || 0,
            percentage: designs.length > 0 ? Math.round(((n._count?.designs || 0) / designs.length) * 100) : 0
        }));

    const responseData = {
        totalDesigns: designs.length,
        totalNiches: niches.length,
        unassignedCount: unassigned.length,
        assignedCount,
        coveragePercent,
        topNiches,
        nicheDistribution
    };
    
    return NextResponse.json(responseData);
}
