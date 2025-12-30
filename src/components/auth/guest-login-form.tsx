"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

import { useFirestore } from "@/firebase";
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

/* ---------------------------- Types ---------------------------- */

type Event = {
  id: string;
  name: string;
  eventDate?: any;
};

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

    try {
      const q = query(
        collection(firestore, "events"),
        where("eventCode", "==", values.eventCode),
        limit(1)
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        toast({
          variant: "destructive",
          title: "Event Not Found",
          description: "No event matches that code.",
        });
        return;
      }

      const doc = snap.docs[0];
      setFoundEvent({ id: doc.id, ...doc.data() } as Event);
    } catch (err) {
      console.error("Event search failed:", err);
      toast({
        variant: "destructive",
        title: "Search Failed",
        description: "Unable to search for the event.",
      });
    } finally {
      setIsSearchingEvent(false);
    }
  }

  /* ---------------------------- Guest Verification ---------------------------- */

  async function onGuestCodeSubmit(values: z.infer<typeof guestCodeSchema>) {
    if (!firestore || !foundEvent) return;

    setIsVerifyingGuest(true);

    try {
      const q = query(
        collection(firestore, `events/${foundEvent.id}/guests`),
        where("accessCode", "==", values.guestCode),
        limit(1)
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        toast({
          variant: "destructive",
          title: "Invalid Guest Code",
          description: "That code does not belong to this event.",
        });
        return;
      }

      const guestDoc = snap.docs[0];

      console.log("Guest verified:", {
        eventId: foundEvent.id,
        guestId: guestDoc.id,
      });

      toast({
        title: "Access Granted",
        description: "Redirecting to your event...",
      });

      router.push("/attendee-dashboard/my-invitations");
    } catch (err) {
      console.error("Guest verification failed:", err);
      toast({
        variant: "destructive",
        title: "Access Failed",
        description: "Unable to verify guest code.",
      });
    } finally {
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
                      placeholder="Your guest code"
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
