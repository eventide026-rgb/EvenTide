'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { GuestCard } from '@/components/stationery/guest-card';
import { InvitationCardClient } from '@/components/stationery/previews/invitation-card-client';
import { GatepassCardClient } from '@/components/stationery/previews/gatepass-card-client';
import { MenuPreviewCard } from '@/components/stationery/previews/menu-preview';
import { ProgramPreviewCard } from '@/components/stationery/previews/program-preview';
import { Loader2 } from 'lucide-react';
import { type Guest } from '@/lib/types';

export default function GuestCardsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [eventId, setEventId] = useState<string | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);

  useEffect(() => {
    setEventId(sessionStorage.getItem('guestEventId'));
    setGuestId(sessionStorage.getItem('guestId'));
  }, []);

  const guestRef = useMemoFirebase(() => {
    if (!firestore || !eventId || !guestId) return null;
    return doc(firestore, 'events', eventId, 'guests', guestId);
  }, [firestore, eventId, guestId]);

  const { data: guest, isLoading: isLoadingGuest } = useDoc<Guest>(guestRef);
  
  const eventRef = useMemoFirebase(() => {
    if (!firestore || !eventId) return null;
    return doc(firestore, 'events', eventId);
  }, [firestore, eventId]);
  const { data: event, isLoading: isLoadingEvent } = useDoc(eventRef);

  const isLoading = isUserLoading || isLoadingGuest || isLoadingEvent;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!event || !guest) {
      return <p>Could not load event or guest details.</p>
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
