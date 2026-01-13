import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const { rawText } = await req.json();
        if (!rawText) return NextResponse.json({ error: "Text required" }, { status: 400 });

        const lines = rawText
            .split(/\r?\n/)
            .map((l: string) => l.trim())
            .filter((l: string) => l.length > 0);

        const nicheId = params.id;

        const stats = {
            assigned: [] as string[],
            notFound: [] as string[]
        };

        const toCreate: { name: string; cleanName: string }[] = [];
        const toAssign: string[] = []; // Store IDs of designs to assign

        // First pass: identify what exists and what needs to be created
        let allDesigns = await db.getDesigns();

        for (const line of lines) {
            // Clean the input line exactly like we do during import
            const nameWithoutExt = line.replace(/\.(png|jpg|jpeg|svg|webp)$/i, "");
            const cleanLine = nameWithoutExt.replace(/[-_]/g, " ").trim();
            const lowerClean = cleanLine.toLowerCase();

            // Find best match
            const match = allDesigns.find(d =>
                d.name.toLowerCase() === lowerClean ||
                d.cleanName.toLowerCase() === lowerClean
            );

            if (match) {
                toAssign.push(match.id);
                stats.assigned.push(match.name);
            } else {
                // Prepare for creation
                toCreate.push({ name: nameWithoutExt, cleanName: cleanLine });
            }
        }

        // Batch create missing designs
        if (toCreate.length > 0) {
            const createdDesigns = await db.addDesigns(toCreate);
            for (const d of createdDesigns) {
                toAssign.push(d.id);
                stats.assigned.push(d.name);
            }
        }

        // Now assign all designs to the niche
        for (const designId of toAssign) {
            await db.assignDesignToNiche(designId, nicheId);
        }

        return NextResponse.json(stats);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
