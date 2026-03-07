
'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import { getRecommendedVendors, type MatchingCriteria } from '@/lib/matching-engine';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Star, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type RecommendedVendorsProps = {
  criteria: MatchingCriteria;
  eventId: string;
};

export function RecommendedVendors({ criteria, eventId }: RecommendedVendorsProps) {
  const firestore = useFirestore();

  const vendorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'vendors'), limit(50));
  }, [firestore]);

  const { data: allVendors, isLoading } = useCollection(vendorsQuery);

  const recommendations = useMemo(() => {
    if (!allVendors) return null;
    return getRecommendedVendors(allVendors, criteria);
  }, [allVendors, criteria]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!recommendations || Object.keys(recommendations).length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>No perfect matches found yet. Try adjusting your event details.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-accent" />
        <h2 className="text-2xl font-headline font-bold">Recommended for Your Event</h2>
      </div>

      <div className="grid gap-8">
        {Object.entries(recommendations).map(([specialty, list]) => (
          <section key={specialty}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{specialty}s</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/resources/vendors?specialty=${specialty}`}>
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {list.map(({ vendor, score, matchReasons }) => (
                <Card key={vendor.id} className="overflow-hidden hover:shadow-lg transition-shadow border-none shadow-sm bg-muted/30">
                  <div className="aspect-video relative">
                    <Image
                      src={vendor.avatarUrl || `https://picsum.photos/seed/${vendor.id}/400/225`}
                      alt={vendor.name}
                      fill
                      className="object-cover"
                    />
                    <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground font-bold">
                      {score}% Match
                    </Badge>
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base truncate">{vendor.name}</CardTitle>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <span>{vendor.rating || '4.0'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{vendor.city}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <ul className="space-y-1 mb-4">
                      {matchReasons.slice(0, 2).map((reason, i) => (
                        <li key={i} className="text-[10px] flex items-center gap-1 text-green-600 font-medium">
                          <CheckCircle className="h-2 w-2" /> {reason}
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" className="w-full h-8 text-xs" asChild>
                      <Link href={`/resources/vendors/${vendor.id}`}>View Profile</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  );
}
