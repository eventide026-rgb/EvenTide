
'use client';

import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from './ui/badge';
import { Star, MapPin, Bookmark, Loader2 } from 'lucide-react';
import { type Vendor } from '@/lib/types';
import { Button } from './ui/button';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

// Dynamic import for heavy proposal dialog
const VendorProposalDialog = dynamic(() => import('./vendor-proposal-dialog').then(m => m.VendorProposalDialog), {
    ssr: false,
    loading: () => <Button className="w-full" disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</Button>
});

type VendorCardProps = {
  vendor: Vendor;
};

export function VendorCard({ vendor }: VendorCardProps) {
  const rating = 4.9; // Placeholder
  const reviewCount = 28; // Placeholder
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(true);
  const pathname = usePathname();

  const isPlannerDashboard = pathname.startsWith('/planner-dashboard');
  const linkHref = `/planner-dashboard/vendor-hub/${vendor.id}`;

  useEffect(() => {
    if (!user || !firestore) {
        setIsBookmarkLoading(false);
        return;
    };
    const checkBookmark = async () => {
        const contactRef = doc(firestore, 'users', user.uid, 'contacts', vendor.id);
        const docSnap = await getDoc(contactRef);
        setIsBookmarked(docSnap.exists());
        setIsBookmarkLoading(false);
    }
    checkBookmark();
  }, [user, firestore, vendor.id]);

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || !firestore) return;

    const contactRef = doc(firestore, 'users', user.uid, 'contacts', vendor.id);
    if (isBookmarked) {
      await deleteDoc(contactRef);
      toast({ title: "Removed from Network" });
      setIsBookmarked(false);
    } else {
      await setDoc(contactRef, { vendorId: vendor.id, addedAt: new Date() });
      toast({ title: "Added to Network" });
      setIsBookmarked(true);
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col group h-full">
      <CardHeader className="p-0">
        <div className="aspect-square relative overflow-hidden">
          <Link href={linkHref} className="absolute inset-0">
             <Image
              src={vendor.avatarUrl || `https://picsum.photos/seed/${vendor.id}/400/400`}
              alt={vendor.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
          {isPlannerDashboard && user && (
            <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 z-10"
                onClick={toggleBookmark}
                disabled={isBookmarkLoading}
            >
                <Bookmark className={cn(isBookmarked ? 'fill-primary text-primary' : '')} />
            </Button>
          )}
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
        {isPlannerDashboard ? (
             <VendorProposalDialog vendor={vendor} />
        ) : (
             <Button className="w-full" asChild><Link href={linkHref}>View Profile</Link></Button>
        )}
      </CardContent>
    </Card>
  );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
