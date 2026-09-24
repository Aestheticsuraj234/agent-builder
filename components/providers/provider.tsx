"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./theme-provider";


export function Provider({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
            <TooltipProvider>
                {children}
            </TooltipProvider>
        </ThemeProvider>
    );
}