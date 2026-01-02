'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

type GuestCardProps = {
  title: string;
  isLocked: boolean;
  children: React.ReactNode;
};

export function GuestCard({ title, isLocked, children }: GuestCardProps) {
  return (
    <div className="relative">
      {isLocked && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg">
          <Lock className="h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground font-semibold">Locked</p>
          <p className="text-xs text-muted-foreground">Unlocks upon check-in</p>
        </div>
      )}
      <Card className={isLocked ? 'border-dashed' : ''}>
        <CardHeader>
          <CardTitle className={isLocked ? 'text-muted-foreground' : ''}>{title}</CardTitle>
        </CardHeader>
        <CardContent className={isLocked ? 'blur-sm' : ''}>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
