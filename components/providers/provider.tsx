"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./theme-provider";
import { QueryProvider } from "./query-provider";


export function Provider({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
            <TooltipProvider>
                <QueryProvider>
                    {children}
                </QueryProvider>
            </TooltipProvider>
        </ThemeProvider>
    );
}