
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { Button } from './ui/button';

export type PlannerProfile = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
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
  const plannerName = planner.name || `${planner.firstName} ${planner.lastName}`;
  
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col">
      <CardHeader className="p-0">
        <div className="aspect-[4/3] relative overflow-hidden">
          <Image
            src={planner.avatarUrl || `https://picsum.photos/seed/${planner.id}/400/300`}
            alt={plannerName}
            fill
            className="object-cover"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex flex-col flex-1">
        <h3 className="font-bold font-headline text-lg truncate">{plannerName}</h3>
        {(planner.city || planner.state) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{planner.city}, {planner.state}</span>
          </div>
        )}
        <div className="mt-4 flex-grow flex items-end">
            {/* In a future step, this could link to a public profile page */}
            <Button variant="outline" className="w-full" asChild>
                <Link href="#">View Profile</Link>
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
