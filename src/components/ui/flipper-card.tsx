'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FlipperCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  flipped?: boolean;
  className?: string;
}

export function FlipperCard({
  front,
  back,
  flipped = false,
  className,
}: FlipperCardProps) {
  return (
    <div className={cn('relative perspective-1000', className)}>
      <div
        className={cn(
          'relative h-full w-full transition-transform duration-500 transform-style-preserve-3d',
          flipped && 'rotate-y-180'
        )}
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden">
          {front}
        </div>

        {/* Back */}
        <div className="absolute inset-0 rotate-y-180 backface-hidden">
          {back}
        </div>
      </div>
    </div>
  );
}
