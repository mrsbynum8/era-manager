import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

console.log("Database Adapter Initializing...");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("POSTGRES_PRISMA_URL exists:", !!process.env.POSTGRES_PRISMA_URL);
console.log("POSTGRES_URL exists:", !!process.env.POSTGRES_URL);

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export class DatabaseAdapter {
    // --- Design Methods ---

    async getDesigns() {
        return await prisma.design.findMany({
            include: { niches: true }
        });
    }

    async addDesigns(newDesigns: { name: string; cleanName: string }[]) {
        const results = [];

        // Prisma doesn't support "createMany" with "skipDuplicates" on all DBs efficiently 
        // in a way that returns the created objects easily. 
        // For simplicity and to return the actual created objects, we'll loop.
        // In a high-volume prod environment, we'd optimize this.

        for (const design of newDesigns) {
            try {
                // Upsert to ensure we don't duplicate on name
                const d = await prisma.design.upsert({
                    where: { name: design.name },
                    update: {}, // Do nothing if exists
                    create: {
                        name: design.name,
                        cleanName: design.cleanName,
                    }
                });

                // Only add to results if it was just created (approximate check based on timestamps would be complex)
                // For this use case, we want to know what we "processed" primarily.
                // But the calling code expects "added" designs.
                // We'll trust upsert's behavior: if we want ONLY new ones, we might need to check existence first.
                // Let's stick to the previous logic: check existence first to be safe and accurate about "added" count.
            } catch (e) {
                console.error(`Failed to add design ${design.name}`, e);
            }
        }

        // Optimized approach for "Add only new":
        // 1. Find existing names
        const names = newDesigns.map(d => d.name);
        const existing = await prisma.design.findMany({
            where: { name: { in: names } },
            select: { name: true }
        });
        const existingSet = new Set(existing.map(d => d.name));

        const toCreate = newDesigns.filter(d => !existingSet.has(d.name));

        if (toCreate.length === 0) return [];

        // Transaction for bulk creation to ensure atomicity isn't strictly required but good practice.
        // `createMany` is fastest but doesn't return the objects (IDs) in standard SQL without `returning`.
        // Prisma `createMany` returns a count.

        // We will simple map create promises.
        const createdParams = await prisma.$transaction(
            toCreate.map(d => prisma.design.create({
                data: {
                    name: d.name,
                    cleanName: d.cleanName
                }
            }))
        );

        return createdParams;
    }

    // --- Niche Methods ---

    async getNiches() {
        return await prisma.niche.findMany({
            include: {
                _count: {
                    select: { designs: true }
                }
            }
        });
    }

    async createNiche(name: string) {
        return await prisma.niche.create({
            data: { name }
        });
    }

    async getNiche(id: string) {
        return await prisma.niche.findUnique({
            where: { id },
            include: {
                designs: {
                    include: {
                        niches: true // if needed
                    }
                }
            }
        });
    }

    // --- Assignment Methods ---

    async assignDesignToNiche(designId: string, nicheId: string) {
        return await prisma.niche.update({
            where: { id: nicheId },
            data: {
                designs: {
                    connect: { id: designId }
                }
            }
        });
    }

    async removeDesignFromNiche(designId: string, nicheId: string) {
        return await prisma.niche.update({
            where: { id: nicheId },
            data: {
                designs: {
                    disconnect: { id: designId }
                }
            }
        });
    }

    // --- Search/Organize ---

    async getUnassignedDesigns() {
        const designs = await prisma.design.findMany({
            include: { niches: true }
        });
        return designs.filter(d => d.niches.length === 0);
    }

    async getDuplicateDesigns() {
        // Prisma doesn't support filtering by relation count easily in `findMany` top-level without raw query or careful syntax
        // But for this app size, we can fetch logic or use a specific filter if supported.
        // Easier: Fetch all designs with niches, filter in memory. 
        // Or better: Use Raw Query for performance, but stick to Prisma for simplicity if dataset < 10k.

        // We can use:
        const designs = await prisma.design.findMany({
            include: { niches: true }
        });
        return designs.filter(d => d.niches.length > 1);
    }

    async searchDesigns(query: string, excludeNicheId?: string) {
        return await prisma.design.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { cleanName: { contains: query, mode: 'insensitive' } }
                ],
                // AND: if exclude niche is present
                ...(excludeNicheId ? {
                    niches: {
                        none: { id: excludeNicheId }
                    }
                } : {})
            },
            take: 50
        });
    }
}

export const db = new DatabaseAdapter();
