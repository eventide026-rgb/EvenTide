
'use client';

import { cn } from "@/lib/utils";

/**
 * EvenTide Logo Component
 * - Typeface: Playfair Display Bold 700 (Serif)
 * - Color: Sky Blue (#60A5FA) to Golden Yellow (#FDE047) horizontal linear gradient
 * - Styling: bg-clip-text for gradient within letterforms
 */
export function Logo({ className }: { className?: string }) {
    return (
        <span className={cn(
            "font-logo font-bold text-lg bg-gradient-to-r from-[#60A5FA] to-[#FDE047] text-transparent bg-clip-text leading-none select-none tracking-tight",
            className
        )}>
            EvenTide
        </span>
    );
}
