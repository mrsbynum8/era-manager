import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const niche = db.getNiche(params.id);

    if (!niche) {
        return NextResponse.json({ error: "Niche not found" }, { status: 404 });
    }

    return NextResponse.json(niche);
}
