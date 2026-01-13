"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, Loader2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

type Design = {
    id: string;
    name: string;
    cleanName: string;
    niches?: { niche: { name: string } }[];
};

export default function OrganizePage() {
    const [activeTab, setActiveTab] = useState<"unassigned" | "duplicates">("unassigned");

    const { data: designs, isLoading } = useQuery<Design[]>({
        queryKey: ["organize", activeTab],
        queryFn: async () => {
            const res = await fetch(`/api/designs/organize?type=${activeTab}`);
            return res.json();
        },
    });

    return (
        <main className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Organize Library</h1>
                    <p className="text-muted-foreground mt-2">Manage unassigned designs and resolve duplicates.</p>
                </div>
            </div>

            <div className="flex gap-6 border-b border-white/5 pb-1">
                <button
                    onClick={() => setActiveTab("unassigned")}
                    className={cn(
                        "pb-3 text-sm font-bold border-b-2 transition-all px-2",
                        activeTab === "unassigned"
                            ? "border-blue-500 text-blue-400"
                            : "border-transparent text-muted-foreground hover:text-white"
                    )}
                >
                    Unassigned Designs
                </button>
                <button
                    onClick={() => setActiveTab("duplicates")}
                    className={cn(
                        "pb-3 text-sm font-bold border-b-2 transition-all px-2",
                        activeTab === "duplicates"
                            ? "border-secondary text-secondary"
                            : "border-transparent text-muted-foreground hover:text-white"
                    )}
                >
                    Duplicates
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {designs?.length === 0 && (
                        <div className="col-span-full py-20 text-center glass-panel rounded-3xl flex flex-col items-center justify-center text-muted-foreground">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <LayoutGrid className="w-8 h-8 opacity-50" />
                            </div>
                            <p className="text-lg font-medium">All clear!</p>
                            <p className="text-sm">No {activeTab} designs found.</p>
                        </div>
                    )}

                    {designs?.map((design) => (
                        <div key={design.id} className="glass-card p-5 rounded-2xl group hover:bg-white/5">
                            <div className="flex justify-between items-start gap-2 mb-2">
                                <div className="font-bold truncate text-white" title={design.cleanName || design.name}>
                                    {design.cleanName || design.name}
                                </div>
                                <div className="p-1.5 rounded-lg bg-white/5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Copy className="w-3 h-3" />
                                </div>
                            </div>

                            <div className="text-xs text-muted-foreground font-mono truncate mb-4 opacity-70">{design.name}</div>

                            {activeTab === "duplicates" && (
                                <div className="flex flex-wrap gap-2 text-[10px] uppercase font-bold tracking-wider">
                                    {design.niches?.map(n => (
                                        <span key={n.niche.name} className="px-2 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded">
                                            {n.niche.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {activeTab === "unassigned" && (
                                <div className="text-[10px] uppercase font-bold tracking-wider text-blue-400/80 bg-blue-400/10 px-2 py-1 rounded w-fit">
                                    Needs Niche
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
