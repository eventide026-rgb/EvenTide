
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
import { useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

type Event = {
  id: string;
  name: string;
  eventDate: any;
};

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
  const [foundEvent, setFoundEvent] = useState<Event | null>(null);
  const [isSearching, setIsSearching] = useState(false);

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
    
    const eventsRef = collection(firestore, 'events');
    const q = query(eventsRef, where("eventCode", "==", values.eventCode), limit(1));
    
    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            toast({
                variant: "destructive",
                title: "Event Not Found",
                description: "No event found with that code. Please check and try again.",
            });
        } else {
            const eventDoc = querySnapshot.docs[0];
            setFoundEvent({ id: eventDoc.id, ...eventDoc.data() } as Event);
        }
    } catch(error) {
        console.error("Error searching for event:", error);
        toast({
            variant: 'destructive',
            title: 'Search Failed',
            description: 'An error occurred while searching for the event.',
        });
    } finally {
        setIsSearching(false);
    }
  }

  function onGuestCodeSubmit(values: z.infer<typeof guestCodeSchema>) {
    // Mock login logic with the found event and guest code
    console.log({
        eventId: foundEvent?.id,
        guestCode: values.guestCode
    });
    toast({
      title: "Access Granted",
      description: "Redirecting to your event dashboard...",
    });
    // This should redirect to a guest-specific dashboard
    router.push('/attendee-dashboard/my-invitations'); 
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
                <Button type="submit" className="w-full">
                Access Event
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
