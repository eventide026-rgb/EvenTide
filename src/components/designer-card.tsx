
'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from './ui/badge';
import { Star, MapPin } from 'lucide-react';
import { type Vendor } from '@/lib/types';
import { FashionProposalDialog } from './fashion-proposal-dialog';

type DesignerCardProps = {
  designer: Vendor;
};

export function DesignerCard({ designer }: DesignerCardProps) {
  const rating = 4.9; // Placeholder
  const reviewCount = 28; // Placeholder

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col group">
      <CardHeader className="p-0">
        <div className="aspect-square relative overflow-hidden">
          <Image
            src={designer.avatarUrl || `https://picsum.photos/seed/${designer.id}/400/400`}
            alt={designer.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
        <div className="flex-grow">
            <h3 className="font-bold font-headline text-lg truncate">{designer.name}</h3>
            <Badge variant="outline">{designer.specialty}</Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">{rating}</span>
                <span>({reviewCount})</span>
            </div>
            {designer.city && designer.state && (
                 <div className="flex items-center gap-1 truncate">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{designer.city}, {designer.state}</span>
                </div>
            )}
        </div>
        <FashionProposalDialog designer={designer} />
      </CardContent>
    </Card>
  );
}
