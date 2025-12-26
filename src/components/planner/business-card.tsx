
'use client';

import { useMemo } from 'react';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Phone, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { type Vendor } from '@/lib/types';

type BusinessCardProps = {
  contactId: string;
  searchTerm: string;
};

function BusinessCardComponent({ contactId, searchTerm }: BusinessCardProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const vendorRef = useMemoFirebase(() => {
    if (!firestore || !contactId) return null;
    return doc(firestore, "events", contactId);
  }, [firestore, contactId]);

  const { data: vendor, isLoading } = useDoc<Vendor>(vendorRef);

  const isVisible = useMemo(() => {
    if (!searchTerm || !vendor) return true;
    const lowercasedFilter = searchTerm.toLowerCase();
    return (
      vendor.name.toLowerCase().includes(lowercasedFilter) ||
      vendor.specialty.toLowerCase().includes(lowercasedFilter)
    );
  }, [vendor, searchTerm]);

  const handleRemove = async () => {
    if (!firestore || !user) return;
    // The contact document ID is often the same as the vendorId in this design
    const contactRef = doc(firestore, "events", user.uid, 'contacts', contactId);
    try {
      await deleteDoc(contactRef);
      toast({
        title: 'Contact Removed',
        description: `${vendor?.name} has been removed from your network.`,
      });
    } catch (error) {
      console.error('Error removing contact:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not remove the contact.',
      });
    }
  };

  if (isLoading) {
    return <BusinessCardSkeleton />;
  }

  if (!vendor || !isVisible) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={vendor.avatarUrl} alt={vendor.name} />
          <AvatarFallback>{vendor.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle>{vendor.name}</CardTitle>
          <CardDescription>
            <Badge variant="secondary">{vendor.specialty}</Badge>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="outline" size="sm" asChild className="w-full justify-start">
          <a href={`mailto:${vendor.email}`}>
            <Mail className="mr-2" /> {vendor.email}
          </a>
        </Button>
        {vendor.phoneNumber && (
          <Button variant="outline" size="sm" asChild className="w-full justify-start">
            <a href={`tel:${vendor.phoneNumber}`}>
              <Phone className="mr-2" /> {vendor.phoneNumber}
            </a>
          </Button>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="w-full">
              <Trash2 className="mr-2" /> Remove from Network
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove {vendor.name} from your personal network. You can always bookmark them again later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRemove}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}

function BusinessCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  );
}

export const BusinessCard = Object.assign(BusinessCardComponent, {
  Skeleton: BusinessCardSkeleton,
});
