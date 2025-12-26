

'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, UserPlus, Info, Trash2, Edit, Send } from 'lucide-react';
import { Label } from '../ui/label';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

type Event = {
  id: string;
  name: string;
  ownerId: string;
  guestCount?: number;
  guestLimit?: number;
};

type Guest = {
    id: string;
    guestId: string;
    name: string;
    email: string;
    phoneNumber?: string;
    category: string;
    rsvpStatus: 'Pending' | 'Accepted' | 'Declined';
    hasCheckedIn: boolean;
    serialNumber?: number;
};

const guestFormSchema = z.object({
  name: z.string().min(2, 'Full name is required.'),
  email: z.string().email('Please enter a valid email.'),
  phoneNumber: z.string().optional(),
  category: z.string().min(1, 'Guest category is required.'),
});

function GuestManagementComponent() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const guestForm = useForm<z.infer<typeof guestFormSchema>>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: { name: '', email: '', phoneNumber: '', category: 'General' },
  });

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'events'), where('ownerId', '==', user.uid));
  }, [firestore, user?.uid]);

  const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

  const selectedEventRef = useMemoFirebase(() => {
    if (!firestore || !selectedEventId) return null;
    return doc(firestore, 'events', selectedEventId);
  }, [firestore, selectedEventId]);

  const { data: selectedEvent, isLoading: isLoadingSelectedEvent } = useDoc<Event>(selectedEventRef);

  const guestsQuery = useMemoFirebase(() => {
    if (!firestore || !selectedEventId) return null;
    return query(collection(firestore, 'events', selectedEventId, 'guests'), orderBy('name'));
  }, [firestore, selectedEventId]);

  const { data: guests, isLoading: isLoadingGuests } = useCollection<Guest>(guestsQuery);

  const isWalkthrough = searchParams.get('walkthrough') === 'true';

  useEffect(() => {
    if (events && events.length === 1 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  const handleAddGuest = async (values: z.infer<typeof guestFormSchema>) => {
    if (!firestore || !selectedEventId) return;

    const guestCollectionRef = collection(firestore, 'events', selectedEventId, 'guests');
    const newGuestRef = doc(guestCollectionRef);
    const guestId = `gst-${newGuestRef.id.substring(0, 8)}`;

    const newGuestData = {
        guestId: guestId,
        name: values.name,
        email: values.email,
        phoneNumber: values.phoneNumber,
        category: values.category,
        rsvpStatus: 'Pending' as const,
        hasCheckedIn: false,
        createdAt: serverTimestamp(),
    };

    addDoc(guestCollectionRef, newGuestData)
        .then(() => {
            toast({ title: 'Guest Added', description: `${values.name} has been added to your guest list.` });
            guestForm.reset();
        })
        .catch(async (serverError) => {
            console.error("Error adding guest:", serverError);
            const permissionError = new FirestorePermissionError({
              path: guestCollectionRef.path,
              operation: 'create',
              requestResourceData: newGuestData,
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        });
  };

  const isLoading = isUserLoading || isLoadingEvents;
  const isFormSubmitting = guestForm.formState.isSubmitting;

  return (
    <div className="grid md:grid-cols-3 gap-8 items-start h-full">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Guest Roster</CardTitle>
          <CardDescription>
            {selectedEvent ? `Showing guests for "${selectedEvent.name}"` : "Select an event to see the guest list."}
          </CardDescription>
        </CardHeader>
        <CardContent>
            {isLoadingGuests && selectedEventId ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : guests && guests.length > 0 ? (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>RSVP</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {guests.map(guest => (
                                <TableRow key={guest.id}>
                                    <TableCell className="font-medium">{guest.name}</TableCell>
                                    <TableCell><Badge variant="outline">{guest.category}</Badge></TableCell>
                                    <TableCell>{guest.rsvpStatus}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon"><Send className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="text-center py-16 border-dashed border-2 rounded-lg">
                    <UserPlus className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-xl font-semibold">Your guest list is empty</h3>
                    <p className="mt-1 text-muted-foreground">
                        {selectedEventId ? "Use the form to start adding guests." : "Select an event to begin."}
                    </p>
                </div>
            )}
        </CardContent>
      </Card>
      <div className="md:col-span-1 space-y-6">
        {isWalkthrough && (
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Next Step: Build Your Guest List!</AlertTitle>
                <AlertDescription>
                    Now that you've created your event, it's time to invite your attendees.
                </AlertDescription>
            </Alert>
        )}
        <Card>
            <CardHeader>
                <CardTitle>Add New Guest</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="space-y-4">
                    <div>
                        <Label>Select Event</Label>
                         {isLoading ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Loading events...</span>
                            </div>
                        ) : (
                            <Select onValueChange={setSelectedEventId} value={selectedEventId || ''}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose an event" />
                            </SelectTrigger>
                            <SelectContent>
                                {events && events.length > 0 ? (
                                events.map((event) => (<SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>))
                                ) : (
                                <SelectItem value="no-events" disabled>Create an event first</SelectItem>
                                )}
                            </SelectContent>
                            </Select>
                        )}
                    </div>
                    <Form {...guestForm}>
                        <form onSubmit={guestForm.handleSubmit(handleAddGuest)} className="space-y-4 pt-4 border-t">
                            <FormField control={guestForm.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g., Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <FormField control={guestForm.control} name="email" render={({ field }) => (
                                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="jane.doe@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={guestForm.control} name="category" render={({ field }) => (
                                <FormItem><FormLabel>Category</FormLabel>
                                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Chairperson">Chairperson</SelectItem>
                                        <SelectItem value="General">General</SelectItem>
                                        <SelectItem value="VIP">VIP</SelectItem>
                                        <SelectItem value="VVIP">VVIP</SelectItem>
                                        <SelectItem value="Family">Family</SelectItem>
                                        <SelectItem value="Staff">Staff</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage /></FormItem>
                            )}/>
                            <Button type="submit" className="w-full" disabled={!selectedEventId || isFormSubmitting}>
                                {isFormSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                                {isFormSubmitting ? "Adding Guest..." : "Add Guest"}
                            </Button>
                        </form>
                    </Form>
                 </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function GuestManagement() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin"/></div>}>
            <GuestManagementComponent />
        </Suspense>
    )
}
