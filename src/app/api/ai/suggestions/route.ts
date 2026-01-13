import { NextResponse } from "next/server";
import OpenAI from "openai";
import { db } from "@/lib/db";

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: Request) {
    try {
        const { type, context } = await req.json();
        let prompt = "";
        let dataContext = "";

        // 1. Fetch relevant data from JSON DB based on prompt type
        if (type === "niches") {
            const unassigned = await db.getUnassignedDesigns();
            if (unassigned.length === 0) return NextResponse.json({ text: "No unassigned designs found to categorize." });
            
            const sliced = unassigned.slice(0, 100);
            dataContext = `List of Designs: ${sliced.map((d: any) => d.cleanName || d.name).join(", ")}`;
            prompt = `Analyze this list of design names and group them into 5-8 logical "Niche" categories (e.g. "Sports", "Professions", "Holidays").\nReturn the response as a formatted list with the Niche Name and 3-4 example designs from the list for each.`;

        } else if (type === "matching") {
            if (!context) return NextResponse.json({ error: "Context required" }, { status: 400 });
            const unassigned = await db.getUnassignedDesigns();
            if (unassigned.length === 0) return NextResponse.json({ text: "No unassigned designs found to search." });

            const nicheName = context;

            // Don't pre-filter strictly. Let AI do the semantic matching.
            // Take up to 150 designs to analyze.
            const candidates = unassigned.slice(0, 150);

            dataContext = `Unassigned Candidates: ${candidates.map((d: any) => d.cleanName || d.name).join(", ")}`;
            prompt = `Analyze the list of candidates and identify which ones clearly belong to the "${nicheName}" niche.\nReturn ONLY a bulleted list of the matching design names. If none match, say "No matching designs found in the unassigned list."`;

        } else if (type === "missing") {
            if (!context) return NextResponse.json({ error: "Context required" }, { status: 400 });
            const nicheName = context;

            const allNiches = await db.getNiches();
            const targetNiche = allNiches.find((n: any) => n.name.toLowerCase() === nicheName.toLowerCase());

            if (targetNiche) {
                // Fetch niche specifics to get designs
                const nicheWithDesigns = await db.getNiche(targetNiche.id);
                const existingDesigns = nicheWithDesigns ? nicheWithDesigns.designs : [];
                dataContext = `Existing "${nicheName}" designs: ${existingDesigns.map((d: any) => d.name).join(", ")}`;
            } else {
                dataContext = `Niche: ${nicheName} (No existing designs yet)`;
            }

            prompt = `Based on the existing designs for the "${nicheName}" niche, suggest 10 NEW creative "In My [X] Era" design ideas that are strictly related to this niche and missing from the list.\nReturn just the list of ideas.`;
        }

        const completion = await openai.chat.completions.create({
            model: "openai/gpt-4o-mini",
            messages: [
                { role: "system", content: "You are an expert Print-on-Demand Merch Assistant. You analyze design names to help organize them." },
                { role: "user", content: `${prompt}\n\nData:\n${dataContext}` }
            ],
        });

        return NextResponse.json({ text: completion.choices[0].message.content });

    } catch (error: any) {
        console.error("AI error:", error);
        return NextResponse.json({ error: error.message || "AI Error" }, { status: 500 });
    }
}
