"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layers, Plus, Loader2, Search, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Niche = {
    id: string;
    name: string;
    description: string | null;
    _count: {
        designs: number;
    };
};

export default function NichesPage() {
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "count-desc" | "count-asc">("name-asc");

    const { data: niches, isLoading } = useQuery<Niche[]>({
        queryKey: ["niches"],
        queryFn: async () => {
            const res = await fetch("/api/niches");
            if (!res.ok) throw new Error("Failed to fetch");
            return res.json();
        },
    });

    const createMutation = useMutation({
        mutationFn: async (name: string) => {
            const res = await fetch("/api/niches", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });
            if (!res.ok) throw new Error("Failed to create");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["niches"] });
            setNewName("");
            setIsCreating(false);
            toast.success("Niche created successfully!");
        },
        onError: () => {
            toast.error("Failed to create niche.", { duration: Infinity });
        }
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        createMutation.mutate(newName);
    };

    return (
        <main className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Niches</h1>
                    <p className="text-muted-foreground mt-2">Categorize your designs into collections.</p>
                </div>

                <div className="flex gap-3">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-primary outline-none"
                    >
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                        <option value="count-desc">Most Designs</option>
                        <option value="count-asc">Least Designs</option>
                    </select>

                    <button
                        onClick={() => setIsCreating(!isCreating)}
                        className="bg-secondary text-black px-6 py-3 rounded-xl font-bold hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create Niche
                    </button>
                </div>
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} className="glass-panel p-6 rounded-2xl animate-in slide-in-from-top-4 border-l-4 border-l-secondary">
                    <label className="block text-sm font-bold mb-3 text-secondary">NEW NICHE NAME</label>
                    <div className="flex gap-4">
                        <input
                            autoFocus
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-secondary focus:border-transparent outline-none text-lg"
                            placeholder="e.g. Sports, Teacher, Nurse..."
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={createMutation.isPending || !newName}
                            className="bg-primary text-white px-8 rounded-xl font-bold hover:brightness-110 disabled:opacity-50 transition-all"
                        >
                            {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save"}
                        </button>
                    </div>
                </form>
            )}

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {niches
                        ?.sort((a, b) => {
                            switch (sortBy) {
                                case "name-asc":
                                    return a.name.localeCompare(b.name);
                                case "name-desc":
                                    return b.name.localeCompare(a.name);
                                case "count-desc":
                                    return b._count.designs - a._count.designs;
                                case "count-asc":
                                    return a._count.designs - b._count.designs;
                                default:
                                    return 0;
                            }
                        })
                        .map((niche) => (
                            <Link
                                key={niche.id}
                                href={`/niches/${niche.id}`}
                                className="glass-panel p-0 rounded-2xl hover:border-primary/50 transition-all hover:-translate-y-1 group overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Layers className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-mono text-muted-foreground bg-white/5 py-1 px-2 rounded">
                                            {niche.id.slice(-4)}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-bold mb-1 group-hover:text-primary transition-colors">
                                        {niche.name}
                                    </h2>
                                    <div className="text-muted-foreground text-sm">
                                        <span className="text-white font-bold">{niche._count.designs}</span> designs included
                                    </div>
                                </div>
                                <div className="bg-white/5 p-4 flex items-center justify-between text-sm font-medium text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <span>View Details</span>
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </Link>
                        ))}
                </div>
            )}
        </main>
    );
}
