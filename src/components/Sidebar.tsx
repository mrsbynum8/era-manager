"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    UploadCloud,
    Layers,
    Sparkles,
    LayoutGrid,
    Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/import", label: "Import", icon: UploadCloud },
    { href: "/niches", label: "Niches", icon: Layers },
    { href: "/organize", label: "Organize", icon: LayoutGrid },
    { href: "/suggestions", label: "AI Tools", icon: Sparkles },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-20 lg:w-64 fixed inset-y-0 left-0 z-50 flex flex-col glass-panel border-r border-white/5 ml-4 my-4 rounded-3xl h-[calc(100vh-2rem)]">
            <div className="p-8 flex items-center justify-center lg:justify-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-red-900 shadow-lg shadow-primary/50 shrink-0" />
                <span className="hidden lg:block font-bold text-xl tracking-tight text-white">
                    Era<span className="text-primary">Manager</span>
                </span>
            </div>

            <nav className="flex-1 px-4 space-y-4 mt-8">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group",
                                isActive
                                    ? "bg-primary/20 text-white shadow-lg shadow-primary/10"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <Icon className={cn("w-6 h-6", isActive ? "text-primary" : "text-muted-foreground group-hover:text-white")} />
                            <span className={cn("hidden lg:block font-medium", isActive && "text-white")}>
                                {link.label}
                            </span>
                            {isActive && (
                                <div className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_10px_#d4af37]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4">
                <Link
                    href="/settings"
                    className={cn(
                        "flex items-center gap-4 px-4 py-4 w-full rounded-2xl transition-all",
                        pathname === "/settings"
                            ? "bg-primary/20 text-white"
                            : "text-muted-foreground hover:bg-white/5 hover:text-white"
                    )}
                >
                    <Settings className="w-6 h-6" />
                    <span className="hidden lg:block font-medium">Settings</span>
                </Link>
            </div>
        </aside>
    );
}
