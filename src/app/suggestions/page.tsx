"use client";

import { useState } from "react";
import { Sparkles, Loader2, Bot, Wand2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SuggestionsPage() {
    const [promptType, setPromptType] = useState<"niches" | "matching" | "missing">("niches");
    const [context, setContext] = useState("");
    const [result, setResult] = useState("");

    const aiMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/ai/suggestions", {
                method: "POST",
                body: JSON.stringify({ type: promptType, context }),
            });
            if (!res.ok) throw new Error("AI Request failed");
            const data = await res.json();
            return data.text;
        },
        onSuccess: (text) => {
            setResult(text);
            toast.success("Suggestions generated!");
        },
        onError: () => toast.error("Failed to generate suggestions.", { duration: Infinity })
    });

    return (
        <main className="max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-white">AI Assistant</h1>
                <p className="text-muted-foreground mt-2">Leverage AI to categorize and expand your library.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { id: "niches", label: "Categorize Unassigned", desc: "Suggest niches for new designs.", icon: Sparkles },
                    { id: "matching", label: "Populate Niche", desc: "Find designs that fit a specific niche.", icon: Wand2 },
                    { id: "missing", label: "Find Missing Eras", desc: "Brainstorm new design ideas.", icon: Bot },
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            setPromptType(item.id as any);
                            setResult("");
                        }}
                        className={cn(
                            "p-6 rounded-3xl text-left transition-all border group relative overflow-hidden",
                            promptType === item.id
                                ? "bg-purple-500/10 border-purple-500 shadow-[0_0_30px_-10px_rgba(168,85,247,0.4)]"
                                : "glass-card hover:bg-white/5 border-transparent"
                        )}
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors",
                            promptType === item.id ? "bg-purple-500 text-white" : "bg-white/5 text-muted-foreground group-hover:text-white"
                        )}>
                            <item.icon className="w-5 h-5" />
                        </div>
                        <div className={cn("font-bold mb-1", promptType === item.id ? "text-white" : "text-muted-foreground group-hover:text-white")}>
                            {item.label}
                        </div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </button>
                ))}
            </div>

            <div className="glass-panel p-8 rounded-3xl border-t border-white/10">
                {promptType !== "niches" && (
                    <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                        <label className="block text-xs font-bold mb-2 text-purple-400 uppercase tracking-widest">Target Niche</label>
                        <input
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-white/20"
                            placeholder={promptType === "matching" ? "e.g. Sports" : "e.g. Professions"}
                            value={context}
                            onChange={e => setContext(e.target.value)}
                        />
                    </div>
                )}

                <button
                    onClick={() => aiMutation.mutate()}
                    disabled={aiMutation.isPending}
                    className="w-full bg-slate-100 hover:bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.01]"
                >
                    {aiMutation.isPending ? <Loader2 className="animate-spin" /> : <Sparkles className="w-5 h-5 text-purple-600" />}
                    Generate Suggestions
                </button>
            </div>

            {result && (
                <div className="glass-panel p-8 rounded-3xl animate-in fade-in slide-in-from-bottom-6 border border-purple-500/20">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-purple-300">
                        <Bot className="w-5 h-5" />
                        AI Analysis
                    </h3>
                    <div className="prose prose-invert max-w-none">
                        <div className="whitespace-pre-wrap leading-relaxed text-slate-300 font-light">
                            {result}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
