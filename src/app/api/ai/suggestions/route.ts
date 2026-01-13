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
            const sliced = unassigned.slice(0, 50);
            dataContext = `Unassigned Designs (sample): ${sliced.map(d => d.name).join(", ")}`;
            prompt = `Analyze these list of unassigned "Era" designs (e.g. "In My [X] Era") and suggest 5-10 new Niche categories to organize them into. Format as a bulleted list.`;

        } else if (type === "matching") {
            if (!context) return NextResponse.json({ error: "Context required" }, { status: 400 });
            const unassigned = await db.getUnassignedDesigns(); // Get all to search properly
            const nicheName = context;

            // Simple heuristic search in JS to find candidates for the prompt
            const candidates = unassigned
                .filter(d => d.name.toLowerCase().includes(nicheName.toLowerCase()) || (d.cleanName && d.cleanName.toLowerCase().includes(nicheName.toLowerCase())))
                .slice(0, 30);

            dataContext = `Candidates: ${candidates.map(d => d.name).join(", ")}`;
            prompt = `From the list of candidates, identify which ones definitively belong to the "${nicheName}" niche. Return just the list of matches.`;

        } else if (type === "missing") {
            if (!context) return NextResponse.json({ error: "Context required" }, { status: 400 });
            const nicheName = context;

            const allNiches = await db.getNiches();
            const targetNiche = allNiches.find(n => n.name.toLowerCase() === nicheName.toLowerCase());

            if (targetNiche) {
                // Fetch niche specifics to get designs
                const nicheWithDesigns = await db.getNiche(targetNiche.id);
                const existingDesigns = nicheWithDesigns ? nicheWithDesigns.designs : [];
                dataContext = `Existing "${nicheName}" designs: ${existingDesigns.map(d => d.name).join(", ")}`;
            } else {
                dataContext = `Niche: ${nicheName} (No existing designs yet)`;
            }
        }

        const completion = await openai.chat.completions.create({
            model: "openai/gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are an expert Print-on-Demand Merch Assistant." },
                { role: "user", content: `${prompt}\n\nContext Data:\n${dataContext}` }
            ],
        });

        return NextResponse.json({ text: completion.choices[0].message.content });

    } catch (error: any) {
        console.error("AI error:", error);
        return NextResponse.json({ error: error.message || "AI Error" }, { status: 500 });
    }
}
