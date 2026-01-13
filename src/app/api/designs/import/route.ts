import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { rawText } = body;

        if (!rawText) {
            return NextResponse.json({ error: "No text provided" }, { status: 400 });
        }

        const lines = rawText
            .split(/\r?\n/)
            .map((line: string) => line.trim())
            .filter((line: string) => line.length > 0);

        const distinctLines = Array.from(new Set(lines)) as string[];

        const processed = distinctLines.map((line: string) => {
            const name = line.replace(/\.(png|jpg|jpeg|svg|webp)$/i, "");
            const cleanName = name.replace(/[-_]/g, " ");
            return { name, cleanName };
        });

        const addedDesigns = db.addDesigns(processed);
        const addedCount = addedDesigns.length;

        // Calculate stats
        // Note: 'existing' count is approximate in this context (total input - added)
        const existingCount = lines.length - addedCount;

        return NextResponse.json({
            success: true,
            stats: {
                processed: lines.length,
                added: addedCount,
                existing: existingCount
            }
        });

    } catch (error: any) {
        console.error("Import error:", error);
        return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
    }
}
