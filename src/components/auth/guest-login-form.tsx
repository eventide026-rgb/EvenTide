
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useFirestore, useAuth, useMemoFirebase } from "@/firebase";
import { collection, query, where, getDocs, limit, doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { signInAnonymously } from "firebase/auth";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";


type Event = {
  id: string;
  name: string;
  eventDate: any;
};

type Guest = {
    id: string; // The document ID
    guestId: string;
    // ... other guest properties
}

const eventCodeSchema = z.object({
  eventCode: z.string().min(1, { message: "Event code is required." }),
});

const guestCodeSchema = z.object({
  guestCode: z.string().min(1, { message: "Guest code is required." }),
});

export function GuestLoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  const auth = useAuth();
  const [foundEvent, setFoundEvent] = useState<Event | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isVerifyingGuest, setIsVerifyingGuest] = useState(false);

  const eventCodeForm = useForm<z.infer<typeof eventCodeSchema>>({
    resolver: zodResolver(eventCodeSchema),
    defaultValues: { eventCode: "" },
  });

  const guestCodeForm = useForm<z.infer<typeof guestCodeSchema>>({
    resolver: zodResolver(guestCodeSchema),
    defaultValues: { guestCode: "" },
  });

  async function onEventCodeSubmit(values: z.infer<typeof eventCodeSchema>) {
    if (!firestore) return;
    setIsSearching(true);
    setFoundEvent(null);

    const collectionsToSearch = ['events', 'shows'];
    let eventFound = false;
    let collectionPath = '';

    try {
        for (const col of collectionsToSearch) {
            collectionPath = col;
            const collectionRef = collection(firestore, col);
            const q = query(collectionRef, where("eventCode", "==", values.eventCode.trim()), limit(1));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const eventDoc = querySnapshot.docs[0];
                setFoundEvent({ id: eventDoc.id, ...eventDoc.data() } as Event);
                eventFound = true;
                break; 
            }
        }

        if (!eventFound) {
            toast({
                variant: "destructive",
                title: "Event Not Found",
                description: "No event found with that code. Please check and try again.",
            });
        }
    } catch(error: any) {
        console.error("Error searching for event:", error);
        
        if (error.code === 'permission-denied') {
            errorEmitter.emit(
                'permission-error',
                new FirestorePermissionError({
                  path: collectionPath,
                  operation: 'list',
                })
            );
        }

        toast({
            variant: 'destructive',
            title: 'Search Failed',
            description: 'An error occurred while searching for the event.',
        });
    } finally {
        setIsSearching(false);
    }
  }

 async function onGuestCodeSubmit(values: z.infer<typeof guestCodeSchema>) {
    if (!firestore || !auth || !foundEvent) return;
    setIsVerifyingGuest(true);

    try {
        const guestsRef = collection(firestore, 'events', foundEvent.id, 'guests');
        const q = query(guestsRef, where("guestCode", "==", values.guestCode.trim()), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            toast({
                variant: "destructive",
                title: "Invalid Guest Code",
                description: "This guest code is not valid for this event.",
            });
            setIsVerifyingGuest(false);
            return;
        }

        const guestDoc = querySnapshot.docs[0];
        const guestData = { id: guestDoc.id, ...guestDoc.data() } as Guest;

        // Sign in anonymously
        const userCredential = await signInAnonymously(auth);
        const user = userCredential.user;

        // Link anonymous UID to guest document
        await updateDoc(doc(firestore, 'events', foundEvent.id, 'guests', guestData.id), {
            userProfileId: user.uid // Link the UID
        });

        sessionStorage.setItem('isNewLogin', 'true');
        sessionStorage.setItem('guestEventId', foundEvent.id);
        sessionStorage.setItem('guestEventName', foundEvent.name);
        
        toast({
            title: "Access Granted",
            description: "Redirecting to your event dashboard...",
        });
        
        router.push('/attendee-dashboard/my-invitations');

    } catch (error) {
        console.error("Error verifying guest or signing in:", error);
        toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'Could not verify your guest code. Please try again.',
        });
        setIsVerifyingGuest(false);
    }
  }


  if (foundEvent) {
    return (
        <div className="space-y-4">
            <Card className="bg-muted">
                <CardHeader>
                    <CardTitle>{foundEvent.name}</CardTitle>
                    <CardDescription>{format(foundEvent.eventDate.toDate(), 'PPP')}</CardDescription>
                </CardHeader>
            </Card>
            <Form {...guestCodeForm}>
            <form onSubmit={guestCodeForm.handleSubmit(onGuestCodeSubmit)} className="space-y-4">
                <FormField
                control={guestCodeForm.control}
                name="guestCode"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Enter Your Guest Code</FormLabel>
                    <FormControl>
                        <Input
                        placeholder="Your unique guest code"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        autoFocus
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" className="w-full" disabled={isVerifyingGuest}>
                   {isVerifyingGuest && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                   {isVerifyingGuest ? 'Verifying...' : 'Access Event'}
                </Button>
                 <Button variant="link" className="w-full" onClick={() => setFoundEvent(null)}>
                    Wrong event? Go back.
                </Button>
            </form>
            </Form>
        </div>
    )
  }

  return (
    <Form {...eventCodeForm}>
      <form onSubmit={eventCodeForm.handleSubmit(onEventCodeSubmit)} className="space-y-4">
        <FormField
          control={eventCodeForm.control}
          name="eventCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Code</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., WDO-O2CAP5"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSearching}>
          {isSearching && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
          {isSearching ? 'Finding...' : 'Find Event'}
        </Button>
      </form>
    </Form>
  );
}
