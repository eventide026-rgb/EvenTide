
'use client';

import { cn } from "@/lib/utils";

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
