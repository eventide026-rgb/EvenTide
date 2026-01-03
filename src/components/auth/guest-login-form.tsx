

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  doc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

import { useFirestore, useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { signInAnonymously } from 'firebase/auth';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/* ---------------------------- Types ---------------------------- */

type Event = {
  id: string;
  name: string;
  eventCode?: string;
  eventDate?: any;
};

type Guest = {
  id: string;
  name: string;
  guestCode: string;
};

type GuestCode = {
    guestId: string;
}

/* ---------------------------- Schemas ---------------------------- */

const eventCodeSchema = z.object({
  eventCode: z.string().min(1, 'Event code is required'),
});

const guestCodeSchema = z.object({
  guestCode: z.string().min(1, 'Guest code is required'),
});

/* ---------------------------- Component ---------------------------- */

export function GuestLoginForm() {
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [foundEvent, setFoundEvent] = useState<Event | null>(null);
  const [isSearchingEvent, setIsSearchingEvent] = useState(false);
  const [isVerifyingGuest, setIsVerifyingGuest] = useState(false);

  /* ---------------------------- Forms ---------------------------- */

  const eventCodeForm = useForm<z.infer<typeof eventCodeSchema>>({
    resolver: zodResolver(eventCodeSchema),
    defaultValues: { eventCode: '' },
  });

  const guestCodeForm = useForm<z.infer<typeof guestCodeSchema>>({
    resolver: zodResolver(guestCodeSchema),
    defaultValues: { guestCode: '' },
  });

  /* ---------------------------- Event Lookup ---------------------------- */

  async function onEventCodeSubmit(values: z.infer<typeof eventCodeSchema>) {
    if (!firestore) return;
    setIsSearchingEvent(true);
    setFoundEvent(null);

    const collectionsToSearch = ['events', 'shows'];
    let eventFound = false;

    for (const col of collectionsToSearch) {
      const collectionRef = collection(firestore, col);
      const q = query(
        collectionRef,
        where('eventCode', '==', values.eventCode.trim()),
        limit(1)
      );

      try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const eventDoc = querySnapshot.docs[0];
          setFoundEvent({ id: eventDoc.id, ...eventDoc.data() } as Event);
          eventFound = true;
          break;
        }
      } catch (err: any) {
        console.error(`Error searching collection ${col}:`, err);
      }
    }

    if (!eventFound) {
      toast({
        variant: 'destructive',
        title: 'Event Not Found',
        description:
          'No event found with that code. Please check and try again.',
      });
    }

    setIsSearchingEvent(false);
  }

  /* ---------------------------- Guest Verification ---------------------------- */

  async function onGuestCodeSubmit(values: z.infer<typeof guestCodeSchema>) {
    if (!firestore || !foundEvent || !auth) return;
    setIsVerifyingGuest(true);

    const guestCode = values.guestCode.trim();
    const guestCodeRef = doc(firestore, `events/${foundEvent.id}/guestCodes`, guestCode);
    
    try {
        const guestCodeSnap = await getDoc(guestCodeRef);
        if (!guestCodeSnap.exists()) {
            toast({ variant: 'destructive', title: 'Invalid Guest Code' });
            setIsVerifyingGuest(false);
            return;
        }

        const { guestId } = guestCodeSnap.data() as GuestCode;
        const guestDocRef = doc(firestore, `events/${foundEvent.id}/guests`, guestId);
        const guestSnap = await getDoc(guestDocRef);
        
        if (!guestSnap.exists()) {
            toast({ variant: 'destructive', title: 'Guest Record Not Found' });
            setIsVerifyingGuest(false);
            return;
        }
        
        const guestData = guestSnap.data() as Guest;
        
        // This is a simplified custom token flow. In a real app, you'd use a server function.
        const userCredential = await signInAnonymously(auth);
        const user = userCredential.user;

        // Associate the anonymous user's UID with the guest document
        // This only needs to be done once.
        if (guestData.id !== user.uid) {
            await updateDoc(guestDocRef, { id: user.uid });
        }
        
        sessionStorage.setItem('guestEventId', foundEvent.id);
        sessionStorage.setItem('guestEventName', foundEvent.name);
        sessionStorage.setItem('guestEventCode', foundEvent.eventCode || '');
        sessionStorage.setItem('guestCode', guestData.guestCode);
        sessionStorage.setItem('guestName', guestData.name);
        sessionStorage.setItem('guestId', user.uid); // The user's auth UID is the guest document ID

        toast({ title: 'Access Granted', description: 'Redirecting...' });
        router.push('/guest-dashboard/my-invitations');

    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Login Failed', description: 'An unexpected error occurred.' });
        setIsVerifyingGuest(false);
    }
  }

  /* ---------------------------- Guest Code Step ---------------------------- */

  if (foundEvent) {
    return (
      <div className="space-y-4">
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>{foundEvent.name}</CardTitle>
            <CardDescription>
              {foundEvent.eventDate?.toDate
                ? format(foundEvent.eventDate.toDate(), 'PPP')
                : 'Date not set'}
            </CardDescription>
          </CardHeader>
        </Card>

        <Form {...guestCodeForm}>
          <form
            onSubmit={guestCodeForm.handleSubmit(onGuestCodeSubmit)}
            className="space-y-4"
          >
            <FormField
              control={guestCodeForm.control}
              name="guestCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guest Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your unique guest code"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isVerifyingGuest}
            >
              {isVerifyingGuest && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Access Event
            </Button>

            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => setFoundEvent(null)}
            >
              Wrong event? Go back
            </Button>
          </form>
        </Form>
      </div>
    );
  }

  /* ---------------------------- Event Code Step ---------------------------- */

  return (
    <Form {...eventCodeForm}>
      <form
        onSubmit={eventCodeForm.handleSubmit(onEventCodeSubmit)}
        className="space-y-4"
      >
        <FormField
          control={eventCodeForm.control}
          name="eventCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Code</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. WDO-O2CAP5"
                  {...field}
                  onChange={(e) =>
                    field.onChange(e.target.value.toUpperCase())
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSearchingEvent}>
          {isSearchingEvent && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {isSearchingEvent ? 'Finding...' : 'Find Event'}
        </Button>
      </form>
    </Form>
  );
}
