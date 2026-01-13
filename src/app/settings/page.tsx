"use client";

import { useState } from "react";
import { Settings as SettingsIcon, Save, Key, Database, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
    const [apiKey, setApiKey] = useState("");
    const [showKey, setShowKey] = useState(false);

    const handleSaveApiKey = () => {
        // In a real app, you'd save this securely
        toast.success("API key saved! (Note: This is stored in your browser only)");
    };

    const handleClearData = () => {
        if (confirm("Are you sure you want to clear all data? This cannot be undone!")) {
            // This would clear the data.json file
            toast.error("Data clearing is not yet implemented", { duration: Infinity });
        }
    };

    return (
        <main className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                    Settings
                </h1>
                <p className="text-muted-foreground mt-2">Manage your application preferences and data.</p>
            </div>

            {/* API Configuration */}
            <div className="glass-panel p-6 rounded-3xl border border-primary/20">
                <div className="flex items-center gap-3 mb-6">
                    <Key className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-bold">API Configuration</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            OpenRouter API Key
                        </label>
                        <div className="flex gap-3">
                            <input
                                type={showKey ? "text" : "password"}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="sk-or-..."
                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none"
                            />
                            <button
                                onClick={() => setShowKey(!showKey)}
                                className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm transition-colors"
                            >
                                {showKey ? "Hide" : "Show"}
                            </button>
                            <button
                                onClick={handleSaveApiKey}
                                className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:brightness-110 transition-all flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Save
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Your API key is used for AI-powered suggestions. Get one at{" "}
                            <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                openrouter.ai
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            {/* Data Management */}
            <div className="glass-panel p-6 rounded-3xl border border-secondary/20">
                <div className="flex items-center gap-3 mb-6">
                    <Database className="w-6 h-6 text-secondary" />
                    <h2 className="text-xl font-bold">Data Management</h2>
                </div>

                <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-xl">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-bold text-white mb-1">Database Location</h3>
                                <p className="text-sm text-muted-foreground">
                                    <code className="bg-black/40 px-2 py-1 rounded text-xs">Postgres</code> (Vercel)
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="font-bold text-red-400 mb-1">Danger Zone</h3>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Clear all designs and niches from the database. This action cannot be undone.
                                </p>
                                <button
                                    onClick={handleClearData}
                                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Clear All Data
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* App Info */}
            <div className="glass-panel p-6 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                    <SettingsIcon className="w-6 h-6 text-white" />
                    <h2 className="text-xl font-bold">About</h2>
                </div>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Version</span>
                        <span className="text-white font-mono">1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Storage</span>
                        <span className="text-white">Vercel Postgres</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Framework</span>
                        <span className="text-white">Next.js 14</span>
                    </div>
                </div>
            </div>
        </main>
    );
}
