"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notFound, useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, MinusCircle, Plus, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Design = {
    id: string;
    name: string;
    cleanName: string | null;
};

type NicheDetail = {
    id: string;
    name: string;
    description: string | null;
    designs: {
        design: Design;
        assignedAt: string;
    }[];
};

export default function NicheDetailsPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const queryClient = useQueryClient();
    const [bulkMode, setBulkMode] = useState(false);
    const [bulkText, setBulkText] = useState("");
    const [assignMode, setAssignMode] = useState(false);
    const [search, setSearch] = useState("");

    const { data: niche, isLoading } = useQuery<NicheDetail>({
        queryKey: ["niche", id],
        queryFn: async () => {
            const res = await fetch(`/api/niches/${id}`);
            if (res.status === 404) notFound();
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
    });

    const { data: searchResults } = useQuery<Design[]>({
        queryKey: ["designs", "search", search],
        queryFn: async () => {
            if (!search) return [];
            const res = await fetch(`/api/designs/search?q=${encodeURIComponent(search)}&excludeNiche=${id}`);
            return res.json();
        },
        enabled: assignMode && !bulkMode && search.length > 2,
    });

    const { data: suggestions } = useQuery<Design[]>({
        queryKey: ["niche", id, "suggestions"],
        queryFn: async () => {
            const res = await fetch(`/api/niches/${id}/suggestions`);
            return res.json();
        },
        enabled: !assignMode
    });

    const assignMutation = useMutation({
        mutationFn: async (designId: string) => {
            await fetch(`/api/niches/${id}/assign`, {
                method: "POST",
                body: JSON.stringify({ designId }),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["niche", id] });
            queryClient.invalidateQueries({ queryKey: ["designs", "search"] });
            toast.success("Design added to niche");
        },
    });

    const bulkAssignMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/niches/${id}/assign-bulk`, {
                method: "POST",
                body: JSON.stringify({ rawText: bulkText }),
            });
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["niche", id] });
            setBulkText("");
            setBulkMode(false);
            setAssignMode(false);
            toast.success(`Bulk add complete. Assigned ${data.assigned.length} designs.`);
            if (data.notFound.length > 0) {
                toast.warning(`${data.notFound.length} designs could not be found.`);
            }
        }
    });

    const removeMutation = useMutation({
        mutationFn: async (designId: string) => {
            await fetch(`/api/niches/${id}/assign`, {
                method: "DELETE",
                body: JSON.stringify({ designId }),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["niche", id] });
            toast.success("Design removed from niche");
        },
    });

    if (isLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;
    if (!niche) return null;

    return (
        <main className="max-w-6xl mx-auto space-y-8">
            <button
                onClick={() => router.back()}
                className="inline-flex items-center text-sm text-muted-foreground hover:text-white transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Niches
            </button>

            <div className="flex items-end justify-between border-b border-white/5 pb-8">
                <div>
                    <div className="text-sm font-mono text-primary mb-2">NICHE DETAILS</div>
                    <h1 className="text-5xl font-black text-white mb-2">{niche.name}</h1>
                    <p className="text-xl text-muted-foreground">{niche.description || "Collection of era designs."}</p>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-bold">{niche.designs.length}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-widest">Designs</div>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-secondary">Assigned Designs</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => { setAssignMode(!assignMode); setBulkMode(false); }}
                        className={cn(
                            "px-5 py-2.5 rounded-xl transition-all font-bold flex items-center gap-2",
                            assignMode && !bulkMode ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
                        )}
                    >
                        <Search className="w-4 h-4" />
                        {assignMode && !bulkMode ? "Done Searching" : "Search to Add"}
                    </button>
                    <button
                        onClick={() => { setAssignMode(!assignMode); setBulkMode(true); }}
                        className={cn(
                            "px-5 py-2.5 rounded-xl transition-all font-bold flex items-center gap-2",
                            assignMode && bulkMode ? "bg-secondary text-black" : "bg-white/10 text-white hover:bg-white/20"
                        )}
                    >
                        <Plus className="w-4 h-4" />
                        {assignMode && bulkMode ? "Done Bulk Adding" : "Bulk Paste"}
                    </button>
                </div>
            </div>

            {assignMode && !bulkMode && (
                <div className="glass-panel p-6 rounded-3xl animate-in fade-in slide-in-from-top-4 border border-secondary/20">
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                        <input
                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-secondary text-lg"
                            placeholder="Search designs to add..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                        {search.length < 3 && <div className="text-center py-8 text-muted-foreground italic">Type at least 3 characters to search...</div>}

                        {searchResults?.length === 0 && search.length >= 3 && (
                            <div className="text-center py-8 text-muted-foreground">No matching unassigned designs found.</div>
                        )}

                        {searchResults?.map(design => (
                            <div key={design.id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                                <span className="font-medium text-white">{design.cleanName || design.name}</span>
                                <button
                                    onClick={() => assignMutation.mutate(design.id)}
                                    disabled={assignMutation.isPending}
                                    className="bg-secondary text-black px-4 py-2 rounded-lg text-sm font-bold hover:brightness-110 shadow-lg shadow-yellow-500/20"
                                >
                                    Add
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {assignMode && bulkMode && (
                <div className="glass-panel p-6 rounded-3xl animate-in fade-in slide-in-from-top-4 border border-secondary/20">
                    <p className="text-sm text-muted-foreground mb-4">Paste a list of designs below. We will find them in your library and add them to this niche.</p>
                    <textarea
                        className="w-full h-40 bg-black/40 border border-white/10 rounded-xl p-4 outline-none focus:ring-2 focus:ring-secondary text-sm font-mono mb-4 resize-none"
                        placeholder={`Design Name 1\nDesign Name 2...`}
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                    />
                    <div className="flex justify-end">
                        <button
                            onClick={() => bulkAssignMutation.mutate()}
                            disabled={!bulkText || bulkAssignMutation.isPending}
                            className="bg-secondary text-black px-6 py-2 rounded-xl font-bold hover:brightness-110 flex items-center gap-2"
                        >
                            {bulkAssignMutation.isPending && <Loader2 className="animate-spin w-4 h-4" />}
                            Process Bulk List
                        </button>
                    </div>
                </div>
            )}

            {!assignMode && suggestions && suggestions.length > 0 && (
                <div className="glass-panel p-6 rounded-3xl border border-primary/20">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-primary">💡 Suggested Designs</h3>
                            <p className="text-sm text-muted-foreground">Unassigned designs that might fit this niche</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {suggestions.slice(0, 8).map((design) => (
                            <div
                                key={design.id}
                                className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group cursor-pointer"
                                onClick={() => assignMutation.mutate(design.id)}
                            >
                                <div className="text-sm font-medium text-white truncate mb-1" title={design.cleanName || design.name}>
                                    {design.cleanName || design.name}
                                </div>
                                {design.cleanName && design.cleanName !== design.name && (
                                    <div className="text-xs text-muted-foreground truncate">{design.name}</div>
                                )}
                                <div className="mt-2 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                    Click to add →
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {niche.designs.length === 0 && !assignMode && (
                <div className="py-20 text-center text-muted-foreground border border-dashed border-white/10 rounded-3xl">
                    This niche is empty. Click "Add Designs" to populate it.
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {niche.designs
                    .sort((a, b) => (a.design.cleanName || a.design.name).localeCompare(b.design.cleanName || b.design.name))
                    .map(({ design }) => (
                        <div key={design.id} className="glass-card p-5 rounded-2xl group relative hover:border-white/20">
                            <div className="font-bold truncate text-white mb-1" title={design.name}>
                                {design.cleanName || design.name}
                            </div>
                            {design.cleanName && design.cleanName !== design.name && (
                                <div className="text-xs text-muted-foreground truncate font-mono opacity-60">{design.name}</div>
                            )}

                            <button
                                onClick={() => removeMutation.mutate(design.id)}
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition-all"
                                title="Remove from niche"
                            >
                                <MinusCircle className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
            </div>
        </main>
    );
}
