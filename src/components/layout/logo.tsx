
'use client';

import { cn } from "@/lib/utils";

/**
 * EvenTide Logo Component
 * Technical Specification:
 * - Typeface: Playfair Display Bold 700 (Serif)
 * - Color: Royal Blue (#4169E1) to Gold (#D4AF37) horizontal linear gradient
 */
export function Logo({ className }: { className?: string }) {
    return (
        <span className={cn(
            "font-logo font-bold text-lg bg-gradient-to-r from-[#4169E1] to-[#D4AF37] text-transparent bg-clip-text leading-none select-none tracking-tight",
            className
        )}>
            EvenTide
        </span>
    );
}
