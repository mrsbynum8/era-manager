import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    console.log("Stats API: Starting");
    const designs = await db.getDesigns();
    console.log(`Stats API: Designs fetched: ${designs.length}`);
    
    const niches = await db.getNiches();
    console.log(`Stats API: Niches fetched: ${niches.length}`);
    if (niches.length > 0) console.log("Sample niche:", JSON.stringify(niches[0]));

    const unassigned = await db.getUnassignedDesigns();
    console.log(`Stats API: Unassigned fetched: ${unassigned.length}`);

    // Calculate coverage
    const assignedCount = designs.length - unassigned.length;
    const coveragePercent = designs.length > 0 ? Math.round((assignedCount / designs.length) * 100) : 0;
    console.log(`Stats API: Assigned: ${assignedCount}, Coverage: ${coveragePercent}`);

    // Get top 3 niches by design count
    const topNiches = niches
        .sort((a: any, b: any) => (b._count?.designs || 0) - (a._count?.designs || 0))
        .slice(0, 3)
        .map((n: any) => ({ id: n.id, name: n.name, count: n._count?.designs || 0 }));
    console.log(`Stats API: Top Niches calculated: ${topNiches.length}`);

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
    
    console.log("Stats API Response:", JSON.stringify(responseData));
    return NextResponse.json(responseData);
}
