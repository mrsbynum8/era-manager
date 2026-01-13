import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const nicheId = params.id;
        const niche = await db.getNiche(nicheId);

        if (!niche) {
            return NextResponse.json({ error: "Niche not found" }, { status: 404 });
        }

        const unassigned = await db.getUnassignedDesigns();

        // If no unassigned designs, return empty
        if (unassigned.length === 0) {
            console.log(`[Suggestions] No unassigned designs available`);
            return NextResponse.json([]);
        }

        console.log(`[Suggestions] Niche: ${niche.name}, Assigned: ${niche.designs.length}, Unassigned: ${unassigned.length}`);

        // If niche has fewer than 3 designs, use keyword matching
        if (niche.designs.length < 3) {
            console.log(`[Suggestions] Using keyword matching (not enough designs for AI)`);
            const nicheLower = niche.name.toLowerCase();
            const keywords = nicheLower.split(/\s+/).filter(k => k.length > 2);

            const suggestions = unassigned
                .filter(design => {
                    const designLower = (design.cleanName || design.name).toLowerCase();
                    return keywords.some(keyword => designLower.includes(keyword));
                })
                .slice(0, 10);

            console.log(`[Suggestions] Keyword matches: ${suggestions.length}`);
            return NextResponse.json(suggestions);
        }

        // Use AI to analyze existing designs and suggest related ones
        // Note: For implicit M-N, niche.designs is Design[]
        const existingDesigns = niche.designs.map(d => d.cleanName || d.name).slice(0, 30);
        const unassignedNames = unassigned.map(d => d.cleanName || d.name);

        console.log(`[Suggestions] Using AI with ${existingDesigns.length} existing designs`);

        // Sample unassigned designs more intelligently - get a diverse set
        const sampleSize = Math.min(200, unassignedNames.length);
        const sampledUnassigned = [];
        const step = Math.floor(unassignedNames.length / sampleSize);
        for (let i = 0; i < unassignedNames.length && sampledUnassigned.length < sampleSize; i += Math.max(1, step)) {
            sampledUnassigned.push(unassignedNames[i]);
        }

        const prompt = `You are helping organize "In My [X] Era" designs for a Print-on-Demand seller.

NICHE: "${niche.name}"

EXISTING DESIGNS IN THIS NICHE:
${existingDesigns.join(", ")}

TASK: Analyze the pattern and theme of the existing designs above. What types of designs fit this niche? What's the common theme?

Then, from the unassigned designs below, select ONLY the ones that match this same theme/pattern.

UNASSIGNED DESIGNS TO CHOOSE FROM:
${sampledUnassigned.join(", ")}

INSTRUCTIONS:
- Return ONLY the EXACT design names from the unassigned list that fit the niche theme
- Return up to 10 designs
- Return ONLY a comma-separated list of names, nothing else
- Do NOT return designs that don't match the theme
- If no good matches exist, return "NONE"`;

        const completion = await openai.chat.completions.create({
            model: "openai/gpt-4o-mini", // Using a better model
            messages: [
                { role: "system", content: "You are an expert at pattern recognition and categorization. You must return ONLY comma-separated design names from the provided list, or 'NONE' if no matches exist." },
                { role: "user", content: prompt }
            ],
            temperature: 0.2,
        });

        const aiResponse = completion.choices[0].message.content || "";
        console.log(`[Suggestions] AI response: ${aiResponse.substring(0, 200)}...`);

        if (aiResponse.trim().toUpperCase() === "NONE") {
            console.log(`[Suggestions] AI found no good matches`);
            return NextResponse.json([]);
        }

        const suggestedNames = aiResponse
            .split(",")
            .map(name => name.trim())
            .filter(name => name.length > 0 && name.toUpperCase() !== "NONE");

        console.log(`[Suggestions] AI suggested ${suggestedNames.length} names`);

        // Match AI suggestions back to actual design objects
        const suggestions = suggestedNames
            .map(name => {
                const nameLower = name.toLowerCase();
                // Try exact match first
                let match = unassigned.find(d => (d.cleanName || d.name).toLowerCase() === nameLower);
                // Then try partial match
                if (!match) {
                    match = unassigned.find(d => 
                        (d.cleanName || d.name).toLowerCase().includes(nameLower) ||
                        nameLower.includes((d.cleanName || d.name).toLowerCase())
                    );
                }
                return match;
            })
            .filter(d => d !== undefined)
            .slice(0, 10);

        console.log(`[Suggestions] Matched ${suggestions.length} designs`);
        return NextResponse.json(suggestions);
    } catch (e: any) {
        console.error("[Suggestions] Error:", e.message);
        // Fallback: return empty instead of bad suggestions
        return NextResponse.json([]);
    }
}
