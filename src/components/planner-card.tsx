
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

export type PlannerProfile = {
  id: string;
  name: string;
  email: string;
  city?: string;
  state?: string;
  bio?: string;
  avatarUrl?: string;
};

type PlannerCardProps = {
  planner: PlannerProfile;
};

export function PlannerCard({ planner }: PlannerCardProps) {
  return (
    <Link href={`/resources/planners/${planner.id}`} className="group block">
      <Card className="overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
        <CardHeader className="p-0">
          <div className="aspect-[4/3] relative overflow-hidden">
            <Image
              src={planner.avatarUrl || `https://picsum.photos/seed/${planner.id}/400/300`}
              alt={planner.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="font-bold font-headline text-lg truncate">{planner.name}</h3>
          {(planner.city || planner.state) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{planner.city}, {planner.state}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
