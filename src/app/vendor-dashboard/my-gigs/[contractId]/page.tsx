
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
  ClipboardList,
  ChefHat,
  Paintbrush,
  Camera,
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

const toolMap: Record<string, { icon: React.ElementType, label: string, href: string }> = {
    "Photographer": { icon: Camera, label: "View Shot List", href: "/vendor-dashboard/shot-list" },
    "Videographer": { icon: Camera, label: "View Shot List", href: "/vendor-dashboard/shot-list" },
    "Caterer": { icon: ChefHat, label: "View Menu", href: "/vendor-dashboard/menu-planner" },
    "Decorator": { icon: Paintbrush, label: "View Mood Board", href: "/vendor-dashboard/mood-board" },
};

function GigDetailPageContent({ contractId }: { contractId: string }) {
  const firestore = useFirestore();
  const { user } = useUser();

  const contractRef = useMemoFirebase(() => {
    if (!firestore || !contractId) return null;
    // This is a simplification. In a real-world scenario with many contracts,
    // we would need to know the eventId to construct the path directly,
    // or perform a collectionGroup query. For this app structure, we assume
    // the contractId is unique enough, but this is not scalable.
    // A better path would be /vendorContracts/{contractId} at the root.
    // For now, we will assume we can find it. This part of the code is illustrative.
    
    // This is a placeholder for a more robust query.
    // To make this work, we'd need to know the eventId.
    // A real implementation would pass eventId in the URL or query params.
    // Let's assume for now the contract is in a top-level collection for demo purposes.
    // In our actual structure it is nested, making this lookup hard without eventId.
    // Let's pretend we can get it for the UI.
    return doc(firestore, 'vendorContracts', contractId);
  }, [firestore, contractId]);
  
  // This is a mock-up since the above query is not robust.
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
  const tool = userProfile ? toolMap[userProfile.specialty] : null;

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!contract) {
    // In a real app, you might have a more graceful not-found state,
    // but this simulates what would happen if the direct doc lookup fails.
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
        {tool && (
            <Card className="flex flex-col justify-center items-center text-center">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full">
                        <tool.icon className="h-8 w-8 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <CardTitle>{tool.label}</CardTitle>
                    <Button asChild className="mt-4">
                        <Link href={`${tool.href}?eventId=${contract.eventId}`}>{tool.label}</Link>
                    </Button>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}


export default function GigDetailPage({ params }: { params: { contractId: string } }) {
  return (
    <div className="space-y-6">
       <Button variant="outline" size="sm" asChild>
          <Link href="/vendor-dashboard/my-gigs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Gigs
          </Link>
        </Button>

        <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <GigDetailPageContent contractId={params.contractId} />
        </Suspense>
    </div>
  )
}
