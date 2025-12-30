
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, limit, doc, updateDoc } from "firebase/firestore";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

import { useFirestore, useAuth } from "@/firebase";
import { useToast } from "@/hooks/use-toast";

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
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signInAnonymously } from "firebase/auth";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

/* ---------------------------- Types ---------------------------- */

type Event = {
  id: string;
  name: string;
  eventDate?: any;
};

type Guest = {
    id: string;
    userProfileId?: string;
}

/* ---------------------------- Schemas ---------------------------- */

const eventCodeSchema = z.object({
  eventCode: z.string().min(1, "Event code is required"),
});

const guestCodeSchema = z.object({
  guestCode: z.string().min(1, "Guest code is required"),
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
    defaultValues: { eventCode: "" },
  });

  const guestCodeForm = useForm<z.infer<typeof guestCodeSchema>>({
    resolver: zodResolver(guestCodeSchema),
    defaultValues: { guestCode: "" },
  });

  /* ---------------------------- Event Lookup ---------------------------- */

  async function onEventCodeSubmit(values: z.infer<typeof eventCodeSchema>) {
    if (!firestore) return;
    setIsSearchingEvent(true);
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
                sessionStorage.setItem('guestEventId', eventDoc.id);
                sessionStorage.setItem('guestEventCode', values.eventCode.trim());
                sessionStorage.setItem('guestEventName', eventDoc.data().name);
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
    } catch(err: any) {
        // Safe, informative logging for many error shapes
        const raw = err ?? 'unknown error';
        const code = err && err.code ? err.code : undefined;
        const message = err && err.message ? err.message : String(raw);
        const details = (() => {
          try {
            return JSON.stringify(err, Object.getOwnPropertyNames(err));
          } catch {
            return String(err);
          }
        })();

        console.error('Detailed Firestore Error:', {
          code,
          message,
          details,
          collectionPath,
          foundEventId: foundEvent?.id ?? null,
        });

        if (code === 'permission-denied') {
          errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
              path: collectionPath,
              operation: 'list',
            })
          );
          toast({
            variant: 'destructive',
            title: 'Permission Denied',
            description: 'You do not have permission to search that collection.',
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Search Failed',
            description: 'An error occurred while searching for the event.',
          });
        }
    } finally {
        setIsSearchingEvent(false);
    }
  }

  /* ---------------------------- Guest Verification ---------------------------- */

  async function onGuestCodeSubmit(values: z.infer<typeof guestCodeSchema>) {
    if (!firestore || !foundEvent || !auth) return;

    setIsVerifyingGuest(true);

    try {
      const q = query(
        collection(firestore, `events/${foundEvent.id}/guests`),
        where("guestCode", "==", values.guestCode),
        limit(1)
      );

      const guestSnap = await getDocs(q);

      if (guestSnap.empty) {
        toast({
          variant: "destructive",
          title: "Invalid Guest Code",
          description: "That code is not valid for this event.",
        });
        setIsVerifyingGuest(false);
        return;
      }

      const guestDoc = guestSnap.docs[0];
      const guestData = guestDoc.data() as Guest;
      
      const userCredential = await signInAnonymously(auth);
      
      if(guestData.userProfileId === null || guestData.userProfileId === undefined) {
         const guestRef = doc(firestore, `events/${foundEvent.id}/guests`, guestDoc.id);
         await updateDoc(guestRef, { userProfileId: userCredential.user.uid });
      }

      toast({
        title: "Access Granted",
        description: "Redirecting to your event dashboard...",
      });
      router.push("/guest-dashboard/my-invitations");

    } catch (err: any) {
        const safeFoundEventId = foundEvent?.id;

        // Safe, informative logging for many error shapes
        const raw = err ?? 'unknown error';
        const code = err && err.code ? err.code : undefined;
        const message = err && err.message ? err.message : String(raw);
        const details = (() => {
          try {
            return JSON.stringify(err, Object.getOwnPropertyNames(err));
          } catch {
            return String(err);
          }
        })();

        console.error('Detailed Firestore Error:', {
            code,
            message,
            details,
            path: safeFoundEventId ? `events/${safeFoundEventId}/guests` : 'unknown path',
        });

        if (code === 'permission-denied') {
            errorEmitter.emit(
                'permission-error',
                new FirestorePermissionError({
                  path: `events/${safeFoundEventId}/guests`,
                  operation: 'list', // This could also be 'update'
                  requestResourceData: { guestCode: values.guestCode },
                })
            );
        }
       
      toast({
        variant: "destructive",
        title: "Access Failed",
        description: "Could not verify your guest code. Please try again.",
      });
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
                ? format(foundEvent.eventDate.toDate(), "PPP")
                : "Date not set"}
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

            <Button type="submit" className="w-full" disabled={isVerifyingGuest}>
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
          {isSearchingEvent ? "Finding..." : "Find Event"}
        </Button>
      </form>
    </Form>
  );
}
