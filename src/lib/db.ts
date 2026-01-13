import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data.json');

export type Design = {
    id: string;
    name: string;
    cleanName: string;
    createdAt: string;
    nicheIds: string[]; // Relationship stored here
};

export type Niche = {
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
};

type Schema = {
    designs: Design[];
    niches: Niche[];
};

// Initial state
const defaultData: Schema = {
    designs: [],
    niches: [],
};

class JSONDatabase {
    private data: Schema | null = null;

    private load() {
        if (this.data) return this.data;

        if (!fs.existsSync(DB_PATH)) {
            this.data = defaultData;
            this.save();
            return this.data;
        }

        try {
            const raw = fs.readFileSync(DB_PATH, 'utf-8');
            this.data = JSON.parse(raw);
        } catch (e) {
            console.error("Failed to parse DB, resetting", e);
            this.data = defaultData;
        }
        return this.data!;
    }

    private save() {
        if (!this.data) return;
        fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    }

    // --- Design Methods ---

    getDesigns() {
        return this.load().designs;
    }

    addDesigns(newDesigns: { name: string; cleanName: string }[]) {
        const data = this.load();
        const existingNames = new Set(data.designs.map(d => d.name));

        let addedCount = 0;

        for (const d of newDesigns) {
            if (!existingNames.has(d.name)) {
                data.designs.push({
                    id: Math.random().toString(36).substring(2, 15),
                    name: d.name,
                    cleanName: d.cleanName,
                    createdAt: new Date().toISOString(),
                    nicheIds: []
                });
                addedCount++;
            }
        }
        this.save();
        return addedCount;
    }

    // --- Niche Methods ---

    getNiches() {
        const data = this.load();
        return data.niches.map(n => ({
            ...n,
            _count: {
                designs: data.designs.filter(d => d.nicheIds.includes(n.id)).length
            }
        }));
    }

    createNiche(name: string) {
        const data = this.load();
        const newNiche: Niche = {
            id: Math.random().toString(36).substring(2, 15),
            name,
            description: null,
            createdAt: new Date().toISOString()
        };
        data.niches.push(newNiche);
        this.save();
        return newNiche;
    }

    getNiche(id: string) {
        const data = this.load();
        const niche = data.niches.find(n => n.id === id);
        if (!niche) return null;

        const assignedDesigns = data.designs
            .filter(d => d.nicheIds.includes(id))
            .map(d => ({
                design: d,
                assignedAt: new Date().toISOString() // Mock for compatibility
            }));

        return { ...niche, designs: assignedDesigns };
    }

    // --- Assignment Methods ---

    assignDesignToNiche(designId: string, nicheId: string) {
        const data = this.load();
        const design = data.designs.find(d => d.id === designId);
        if (design && !design.nicheIds.includes(nicheId)) {
            design.nicheIds.push(nicheId);
            this.save();
        }
    }

    removeDesignFromNiche(designId: string, nicheId: string) {
        const data = this.load();
        const design = data.designs.find(d => d.id === designId);
        if (design) {
            design.nicheIds = design.nicheIds.filter(id => id !== nicheId);
            this.save();
        }
    }

    // --- Search/Organize ---

    getUnassignedDesigns() {
        return this.load().designs.filter(d => d.nicheIds.length === 0);
    }

    getDuplicateDesigns() {
        return this.load().designs.filter(d => d.nicheIds.length > 1);
    }

    searchDesigns(query: string, excludeNicheId?: string) {
        const lowerQ = query.toLowerCase();
        return this.load().designs.filter(d => {
            const matches = d.name.toLowerCase().includes(lowerQ) || d.cleanName.toLowerCase().includes(lowerQ);
            const notInNiche = excludeNicheId ? !d.nicheIds.includes(excludeNicheId) : true;
            return matches && notInNiche;
        }).slice(0, 50);
    }
}

export const db = new JSONDatabase();
