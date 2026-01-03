
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { GuestCard } from '@/components/stationery/guest-card';
import { InvitationCardClient } from '@/components/stationery/previews/invitation-card-client';
import { GatepassCardClient } from '@/components/stationery/previews/gatepass-card-client';
import { MenuPreviewCard } from '@/components/stationery/previews/menu-preview';
import { ProgramPreviewCard } from '@/components/stationery/previews/program-preview';
import { Loader2, AlertTriangle } from 'lucide-react';
import { type Guest } from '@/lib/types';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

function GuestCardsPageContent() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [eventId, setEventId] = useState<string | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    const id = sessionStorage.getItem('guestEventId');
    const gId = sessionStorage.getItem('guestId'); // This is now the UID
    if (id && gId) {
        setEventId(id);
        setGuestId(gId);
        setSessionStatus('loaded');
    } else {
        setSessionStatus('error');
    }
  }, []);

  const guestRef = useMemoFirebase(() => {
    if (!firestore || !eventId || !guestId) return null;
    return doc(firestore, 'events', eventId, 'guests', guestId);
  }, [firestore, eventId, guestId]);

  const { data: guest, isLoading: isLoadingGuest, error: guestError } = useDoc<Guest>(guestRef);
  
  const eventRef = useMemoFirebase(() => {
    if (!firestore || !eventId) return null;
    return doc(firestore, 'events', eventId);
  }, [firestore, eventId]);
  const { data: event, isLoading: isLoadingEvent, error: eventError } = useDoc(eventRef);

  const isLoading = isUserLoading || sessionStatus === 'loading' || isLoadingGuest || isLoadingEvent;
  
  const combinedError = guestError || eventError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (combinedError) {
       return (
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Fetching Data</AlertTitle>
            <AlertDescription>
                <p>We couldn&apos;t load your details. This is often due to a permissions issue.</p>
                <p className="font-mono text-xs bg-black/20 p-2 rounded-md my-2">{combinedError.message}</p>
                <p>Please try logging in again.</p>
                 <Button asChild variant="link" className="p-0 h-auto ml-1">
                    <Link href="/guest-login">Go to Guest Login</Link>
                </Button>
            </AlertDescription>
        </Alert>
      )
  }

  if (sessionStatus === 'error' || (!isLoading && (!event || !guest))) {
      return (
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Your Details</AlertTitle>
            <AlertDescription>
                We couldn&apos;t find the necessary event or guest information. Please try logging in again.
                 <Button asChild variant="link" className="p-0 h-auto ml-1">
                    <Link href="/guest-login">Go to Guest Login</Link>
                </Button>
            </AlertDescription>
        </Alert>
      )
  }
  
  if (!event || !guest) {
      return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">My Cards</h1>
        <p className="text-muted-foreground">Your digital wallet for this event. Some cards unlock after check-in.</p>
      </div>

       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <GuestCard title="Invitation Card" isLocked={false}>
            <InvitationCardClient event={event} guest={guest} />
        </GuestCard>
         <GuestCard title="Digital Gate Pass" isLocked={false}>
            <GatepassCardClient event={event} guest={guest} />
        </GuestCard>
         <GuestCard title="Menu Card" isLocked={!guest.hasCheckedIn}>
             <MenuPreviewCard event={event} />
         </GuestCard>
        <GuestCard title="Program Card" isLocked={!guest.hasCheckedIn}>
            <ProgramPreviewCard event={event} />
        </GuestCard>
       </div>
    </div>
  );
}

export default function GuestCardsPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <GuestCardsPageContent />
        </Suspense>
    )
}
