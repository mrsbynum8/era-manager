import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Providers from "./providers";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Era Design Manager",
    description: "Manage your Era designs and niches",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={cn(inter.className, "bg-background text-foreground antialiased selection:bg-primary/20")}>
                <div className="min-h-screen relative flex">
                    <Providers>
                        <Sidebar />
                        {/* Main Content Area */}
                        <div className="flex-1 ml-24 lg:ml-72 p-4 lg:p-8 overflow-y-auto">
                            {/* Background Elements */}
                            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full z-[-1] pointer-events-none opacity-50" />
                            <div className="fixed bottom-0 left-20 w-[300px] h-[300px] bg-secondary/10 blur-[100px] rounded-full z-[-1] pointer-events-none opacity-30" />

                            {children}
                        </div>
                        <Toaster position="top-right" theme="dark" richColors closeButton />
                    </Providers>
                </div>
            </body>
        </html>
    );
}
