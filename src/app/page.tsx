"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Upload, Sparkles, Loader2, TrendingUp, Target, BarChart3 } from "lucide-react";

export default function DashboardPage() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ["stats"],
        queryFn: async () => {
            const res = await fetch("/api/stats");
            return res.json();
        },
    });

    return (
        <main className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-primary to-secondary">
                    Welcome back, <span className="text-primary">Boss</span>
                </h1>
                <p className="text-muted-foreground mt-2">Your empire of eras is looking good. Here is what's happening today.</p>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:border-primary/50 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all"></div>
                    <div className="relative">
                        <div className="text-sm text-muted-foreground mb-2">Total Niches</div>
                        <div className="text-4xl font-bold text-white mb-1">
                            {isLoading ? <Loader2 className="animate-spin w-8 h-8" /> : stats?.totalNiches || 0}
                        </div>
                        <div className="text-xs text-primary">Active Categories</div>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:border-secondary/50 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 transition-all"></div>
                    <div className="relative">
                        <div className="text-sm text-muted-foreground mb-2">Total Designs</div>
                        <div className="text-4xl font-bold text-white mb-1">
                            {isLoading ? <Loader2 className="animate-spin w-8 h-8" /> : stats?.totalDesigns || 0}
                        </div>
                        <div className="text-xs text-secondary">Library Size</div>
                    </div>
                </div>

                <Link href="/import" className="glass-panel p-6 rounded-3xl hover:border-primary/50 transition-all group cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Upload className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                    <div className="font-bold text-lg mb-1">Import Data</div>
                    <div className="text-sm text-muted-foreground">Add new batch of files.</div>
                </Link>

                <Link href="/ai" className="glass-panel p-6 rounded-3xl hover:border-secondary/50 transition-all group cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-secondary" />
                        </div>
                    </div>
                    <div className="font-bold text-lg mb-1">AI Tools</div>
                    <div className="text-sm text-muted-foreground">Get smart suggestions.</div>
                </Link>
            </div>

            {/* Coverage Stats */}
            <div className="glass-panel p-6 rounded-3xl border border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                    <Target className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-bold">Organization Progress</h2>
                </div>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Designs Assigned</span>
                            <span className="text-sm font-bold text-white">
                                {isLoading ? "..." : `${stats?.assignedCount || 0} / ${stats?.totalDesigns || 0}`}
                            </span>
                        </div>
                        <div className="h-3 bg-black/40 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                                style={{ width: `${stats?.coveragePercent || 0}%` }}
                            ></div>
                        </div>
                        <div className="text-right mt-1">
                            <span className="text-2xl font-bold text-primary">{stats?.coveragePercent || 0}%</span>
                            <span className="text-xs text-muted-foreground ml-1">complete</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Unassigned Designs */}
                <div className="glass-panel p-6 rounded-3xl">
                    <div className="text-sm text-muted-foreground mb-2">Unassigned Designs</div>
                    <div className="text-3xl font-bold text-white mb-2">
                        {isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : (stats?.unassignedCount || 0)}
                    </div>
                    <Link href="/organize" className="text-xs text-primary hover:underline">
                        Organize them →
                    </Link>
                </div>

                {/* Top Niches */}
                <div className="glass-panel p-6 rounded-3xl md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-secondary" />
                        <div className="text-sm text-muted-foreground">Top Niches</div>
                    </div>
                    {isLoading ? (
                        <Loader2 className="animate-spin w-6 h-6" />
                    ) : stats?.topNiches && stats.topNiches.length > 0 ? (
                        <div className="space-y-3">
                            {stats.topNiches.map((niche: any) => (
                                <Link
                                    key={niche.id}
                                    href={`/niches/${niche.id}`}
                                    className="flex justify-between items-center p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                                >
                                    <span className="font-medium text-white">{niche.name}</span>
                                    <span className="text-sm text-muted-foreground">{niche.count} designs</span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">No niches yet. Create one to get started!</p>
                    )}
                </div>
            </div>

            {/* Niche Distribution Chart */}
            {!isLoading && stats?.nicheDistribution && stats.nicheDistribution.length > 0 && (
                <div className="glass-panel p-6 rounded-3xl border border-secondary/20">
                    <div className="flex items-center gap-3 mb-6">
                        <BarChart3 className="w-6 h-6 text-secondary" />
                        <h2 className="text-xl font-bold">Niche Distribution</h2>
                    </div>
                    <div className="space-y-4">
                        {stats.nicheDistribution.slice(0, 8).map((niche: any, idx: number) => (
                            <div key={niche.id}>
                                <div className="flex justify-between mb-2">
                                    <Link href={`/niches/${niche.id}`} className="text-sm font-medium text-white hover:text-primary transition-colors">
                                        {niche.name}
                                    </Link>
                                    <span className="text-sm text-muted-foreground">
                                        {niche.count} designs ({niche.percentage}%)
                                    </span>
                                </div>
                                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                                    <div
                                        className="h-full transition-all duration-500"
                                        style={{
                                            width: `${niche.percentage}%`,
                                            background: `linear-gradient(90deg, hsl(${idx * 40}, 70%, 60%), hsl(${idx * 40 + 20}, 70%, 50%))`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {stats.nicheDistribution.length > 8 && (
                        <Link href="/niches" className="block text-center mt-4 text-sm text-primary hover:underline">
                            View all {stats.nicheDistribution.length} niches →
                        </Link>
                    )}
                </div>
            )}
        </main>
    );
}
