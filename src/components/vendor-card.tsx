
'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from './ui/badge';
import { Star, MapPin } from 'lucide-react';
import { type Vendor } from '@/lib/types';
import { VendorProposalDialog } from './vendor-proposal-dialog';

type VendorCardProps = {
  vendor: Vendor;
};

export function VendorCard({ vendor }: VendorCardProps) {
  const rating = 4.9; // Placeholder
  const reviewCount = 28; // Placeholder

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col">
      <CardHeader className="p-0">
        <div className="aspect-square relative overflow-hidden">
          <Image
            src={vendor.avatarUrl || `https://picsum.photos/seed/${vendor.id}/400/400`}
            alt={vendor.name}
            fill
            className="object-cover"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
        <div className="flex-grow">
            <h3 className="font-bold font-headline text-lg truncate">{vendor.name}</h3>
            <Badge variant="outline">{vendor.specialty}</Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">{rating}</span>
                <span>({reviewCount})</span>
            </div>
            {vendor.city && vendor.state && (
                 <div className="flex items-center gap-1 truncate">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{vendor.city}, {vendor.state}</span>
                </div>
            )}
        </div>
        <VendorProposalDialog vendor={vendor} />
      </CardContent>
    </Card>
  );
}
