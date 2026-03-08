
'use client';

import { use, Suspense } from 'react';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

type VendorContract = {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: any;
  serviceDescription: string;
  vendorId: string;
};

type EventData = {
    location: string;
}

type UserProfile = {
    specialty: string;
}

function GigDetailPageContent({ contractId }: { contractId: string }) {
  const firestore = useFirestore();
  const { user } = useUser();

  const contractRef = useMemoFirebase(() => {
    if (!firestore || !contractId) return null;
    return doc(firestore, 'vendorContracts', contractId);
  }, [firestore, contractId]);
  
  const { data: contract, isLoading: isLoadingContract } = useDoc<VendorContract>(contractRef);
  
  const eventRef = useMemoFirebase(() => {
      if (!firestore || !contract) return null;
      return doc(firestore, 'events', contract.eventId);
  }, [firestore, contract]);
  const { data: event, isLoading: isLoadingEvent } = useDoc<EventData>(eventRef);

  const userProfileRef = useMemoFirebase(() => {
      if (!firestore || !user) return null;
      return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userProfileRef);
  
  const isLoading = isLoadingContract || isLoadingEvent || isLoadingProfile;

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!contract) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-destructive">Contract Not Found</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Could not find details for this gig. It might have been deleted or the link is incorrect.</p>
                <Button asChild variant="link" className="px-0"><Link href="/vendor-dashboard/my-gigs">Return to My Gigs</Link></Button>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">{contract.eventName}</CardTitle>
          <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-2 text-muted-foreground pt-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{contract.eventDate ? format(contract.eventDate.toDate(), 'PPP') : 'Date TBD'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{event?.location || 'Location TBD'}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>My Role & Service</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="mb-4">{userProfile?.specialty || 'Vendor'}</Badge>
            <p className="text-muted-foreground">{contract.serviceDescription}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


export default function GigDetailPage({ params }: { params: Promise<{ contractId: string }> }) {
  const resolvedParams = use(params);
  return (
    <div className="space-y-6">
       <Button variant="outline" size="sm" asChild>
          <Link href="/vendor-dashboard/my-gigs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Gigs
          </Link>
        </Button>

        <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <GigDetailPageContent contractId={resolvedParams.contractId} />
        </Suspense>
    </div>
  )
}
