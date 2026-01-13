"use client";

import { useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ImportPage() {
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<{ processed: number; added: number; existing: number } | null>(null);

    const handleImport = async () => {
        if (!text) {
            toast.error("Please paste some design names first.", { duration: Infinity });
            return;
        }

        setLoading(true);
        setStats(null);
        const toastId = toast.loading("Processing designs...");

        try {
            const res = await fetch("/api/designs/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rawText: text }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            if (data.success) {
                setStats(data.stats);
                setText("");
                toast.success(`Import complete! Added ${data.stats.added} new designs.`, { id: toastId });
            } else {
                toast.error("Import failed.", { id: toastId, duration: Infinity });
            }

        } catch (e: any) {
            console.error(e);
            toast.error(e.message || "Failed to connect to server.", { id: toastId, duration: Infinity });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Import Library</h1>
                    <p className="text-muted-foreground mt-2">Bulk add your designs to the database.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Input Area */}
                <div className="lg:col-span-2 glass-panel p-8 rounded-3xl">
                    <textarea
                        className="w-full h-[400px] bg-black/40 border border-white/5 rounded-2xl p-6 text-white font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition-all placeholder:text-white/20"
                        placeholder={`Baby.png\nIn My Senior Era.jpg\nBasketball Sister\n...`}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <div className="mt-6 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground font-mono">
                            {text ? text.split("\n").filter(t => t.trim().length > 0).length : 0} lines
                        </span>
                        <button
                            onClick={handleImport}
                            disabled={loading || !text}
                            className="bg-primary hover:bg-red-800 text-white px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-primary/25"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                            Start Import
                        </button>
                    </div>
                </div>

                {/* Stats / Info Side */}
                <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-3xl">
                        <h3 className="text-lg font-bold mb-4 text-secondary">Why Import?</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex gap-2"><span className="text-primary">•</span> Clean up messy file names automatically.</li>
                            <li className="flex gap-2"><span className="text-primary">•</span> Avoid duplicates in your database.</li>
                            <li className="flex gap-2"><span className="text-primary">•</span> Enable AI suggestions.</li>
                        </ul>
                    </div>

                    {stats && (
                        <div className="glass-panel p-6 rounded-3xl border-l-[6px] border-l-green-500 animate-in fade-in slide-in-from-bottom-5">
                            <h3 className="font-bold mb-4 text-lg">Results</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Processed</span>
                                    <span className="font-mono text-xl">{stats.processed}</span>
                                </div>
                                <div className="w-full h-px bg-white/5" />
                                <div className="flex justify-between items-center text-green-400">
                                    <span>Added New</span>
                                    <span className="font-mono text-xl font-bold">+{stats.added}</span>
                                </div>
                                <div className="flex justify-between items-center text-secondary">
                                    <span>Duplicates</span>
                                    <span className="font-mono text-xl">{stats.existing}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
