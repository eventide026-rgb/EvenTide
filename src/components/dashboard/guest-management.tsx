

'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, setDoc, serverTimestamp, orderBy, documentId, updateDoc, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';
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
import { Loader2, PlusCircle, UserPlus, Info, Trash2, Edit, Send, Contact, CreditCard } from 'lucide-react';
import { Label } from '../ui/label';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type Event = {
  id: string;
  name: string;
  ownerId: string;
  guestCount?: number;
  guestLimit?: number;
  eventCode?: string;
};

type Guest = {
    id: string; // The guestCode now serves as the document ID
    guestId: string; // A separate, internal unique ID for the guest
    name: string;
    email: string;
    phoneNumber?: string;
    category: string;
    rsvpStatus: 'Pending' | 'Accepted' | 'Declined';
    hasCheckedIn: boolean;
    serialNumber?: number;
    guestCode: string;
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
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  const guestForm = useForm<z.infer<typeof guestFormSchema>>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: { name: '', email: '', phoneNumber: '', category: 'General' },
  });

  const plannerAssignmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'planners'), where('plannerId', '==', user.uid));
  }, [firestore, user?.uid]);
  const { data: assignments } = useCollection(plannerAssignmentsQuery);
  const eventIds = useMemo(() => assignments?.map((a: any) => a.eventId) || [], [assignments]);

  const ownerEventsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'events'), where('ownerId', '==', user.uid));
  }, [firestore, user?.uid]);
  const { data: ownerEvents } = useCollection<Event>(ownerEventsQuery);

  const plannerManagedEventsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid || eventIds.length === 0) return null;
    return query(collection(firestore, 'events'), where(documentId(), 'in', eventIds));
  }, [firestore, user?.uid, eventIds]);
  const { data: plannerEvents } = useCollection<Event>(plannerManagedEventsQuery);

  const events = useMemo(() => {
    const allEvents = [...(ownerEvents || []), ...(plannerEvents || [])];
    const uniqueEvents = Array.from(new Map(allEvents.map(e => [e.id, e])).values());
    return uniqueEvents;
  }, [ownerEvents, plannerEvents]);

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
    if (events && events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);
  
  useEffect(() => {
    if (editingGuest) {
      guestForm.reset(editingGuest);
    } else {
      guestForm.reset({ name: '', email: '', phoneNumber: '', category: 'General' });
    }
  }, [editingGuest, guestForm]);

  const guestCount = guests?.length || 0;
  const guestLimit = selectedEvent?.guestLimit || 20;
  const atCapacity = guestCount >= guestLimit;

  const handleAddGuest = async (values: z.infer<typeof guestFormSchema>) => {
    if (!firestore || !selectedEventId || !selectedEventRef) return;
    
    if (atCapacity) {
        toast({
            variant: "destructive",
            title: "Guest Limit Reached",
            description: "Please upgrade your plan to add more guests."
        });
        return;
    }

    if (values.category === 'Chairperson' && guests?.some(g => g.category === 'Chairperson')) {
        toast({
            variant: "destructive",
            title: "Chairperson Already Exists",
            description: "An event can only have one chairperson.",
        });
        return;
    }

    const batch = writeBatch(firestore);

    const guestCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const guestDocRef = doc(firestore, 'events', selectedEventId, 'guests', guestCode);
    const guestId = `gst-${doc(collection(firestore, 'events')).id.substring(0, 8)}`;


    const newGuestData = {
        guestId: guestId,
        guestCode: guestCode,
        name: values.name,
        email: values.email,
        phoneNumber: values.phoneNumber,
        category: values.category,
        rsvpStatus: 'Pending' as const,
        hasCheckedIn: false,
        createdAt: serverTimestamp(),
    };

    const guestCodeRef = doc(firestore, 'events', selectedEventId, 'guestCodes', guestCode);
    
    batch.set(guestDocRef, newGuestData);
    batch.set(guestCodeRef, { guestId });
    batch.update(selectedEventRef, { guestCount: guestCount + 1 });

    try {
        await batch.commit();
        toast({ title: 'Guest Added', description: `${values.name} has been added to your guest list.` });
        guestForm.reset();
    } catch (error) {
        console.error("Error adding guest:", error);
        toast({
            variant: 'destructive',
            title: "Failed to Add Guest",
            description: "You may have reached your plan's guest limit or lack permissions."
        });
    }
  };

  const handleUpdateGuest = async (values: z.infer<typeof guestFormSchema>) => {
    if (!firestore || !selectedEventId || !editingGuest) return;

    if (values.category === 'Chairperson' && guests?.some(g => g.category === 'Chairperson' && g.id !== editingGuest.id)) {
        toast({
            variant: "destructive",
            title: "Chairperson Already Exists",
            description: "An event can only have one chairperson.",
        });
        return;
    }
    
    const guestRef = doc(firestore, 'events', selectedEventId, 'guests', editingGuest.id);
    
    try {
        await updateDoc(guestRef, { ...values });
        toast({ title: "Guest Updated", description: `${values.name}'s information has been saved.` });
        setEditingGuest(null);
    } catch (error) {
        console.error("Error updating guest:", error);
        toast({ variant: 'destructive', title: "Update Failed", description: "Could not save guest information." });
    }
  };
  
  const handleFormSubmit = (values: z.infer<typeof guestFormSchema>) => {
    if (editingGuest) {
      handleUpdateGuest(values);
    } else {
      handleAddGuest(values);
    }
  };

  const handleSendInvitation = (guestName: string) => {
    toast({
        title: "Invitation Sent!",
        description: `An invitation has been sent to ${guestName}.`,
    });
  }

  const handleDeleteGuest = async (guest: Guest) => {
      if (!firestore || !selectedEventId || !selectedEventRef) return;
      
      const batch = writeBatch(firestore);

      const guestRef = doc(firestore, 'events', selectedEventId, 'guests', guest.id);
      const guestCodeRef = doc(firestore, 'events', selectedEventId, 'guestCodes', guest.id);
      
      batch.delete(guestRef);
      batch.delete(guestCodeRef);
      batch.update(selectedEventRef, { guestCount: guestCount - 1 });

      try {
        await batch.commit();
        toast({
            title: "Guest Removed",
            description: `${guest.name} has been removed from the list.`
        });
      } catch (error) {
          console.error("Error deleting guest:", error);
          toast({ variant: 'destructive', title: 'Deletion Failed' });
      }
  }

  const isLoading = isUserLoading;
  const isFormSubmitting = guestForm.formState.isSubmitting;
  
  const capacityPercentage = guestLimit > 0 ? (guestCount / guestLimit) * 100 : 0;
  const isOwner = user?.uid === selectedEvent?.ownerId;

  return (
    <div className="grid md:grid-cols-3 gap-8 items-start h-full">
      <div className="md:col-span-2 flex flex-col gap-6">
        {selectedEvent && (
             <Card>
                <CardHeader>
                    <CardTitle>Guest Capacity</CardTitle>
                    <CardDescription>
                        {guestCount} of {guestLimit} spots filled.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Progress value={capacityPercentage} />
                </CardContent>
            </Card>
        )}
        <Card>
            <CardHeader>
            <CardTitle>Guest Roster</CardTitle>
            <CardDescription>
                {selectedEvent ? `Showing guests for "${selectedEvent.name}"` : "Select an event to see the guest list."}
                 {selectedEvent?.eventCode && <Badge variant="outline" className="ml-2">{selectedEvent.eventCode}</Badge>}
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
                                    {isOwner && <TableHead>Guest Code</TableHead>}
                                    <TableHead>Category</TableHead>
                                    <TableHead>RSVP</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {guests.map(guest => (
                                    <TableRow key={guest.id}>
                                        <TableCell className="font-medium">{guest.name}</TableCell>
                                        {isOwner && <TableCell><Badge variant="secondary">{guest.guestCode}</Badge></TableCell>}
                                        <TableCell><Badge variant="outline">{guest.category}</Badge></TableCell>
                                        <TableCell>{guest.rsvpStatus}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleSendInvitation(guest.name)}><Send className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => setEditingGuest(guest)}><Edit className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteGuest(guest)}><Trash2 className="h-4 w-4" /></Button>
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
      </div>
      <div className="md:col-span-1 space-y-6">
        {isWalkthrough && (
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Next Step: Build Your Guest List!</AlertTitle>
                <AlertDescription>
                    Now that you've created your event, it's time to invite your attendees. The first 20 guests are free!
                </AlertDescription>
            </Alert>
        )}
        <Card>
            <CardHeader>
                <CardTitle>{editingGuest ? 'Edit Guest' : 'Add New Guest'}</CardTitle>
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
                    {atCapacity && !editingGuest ? (
                        <div className="pt-4 border-t text-center">
                            <h3 className="font-semibold text-destructive">Guest Limit Reached</h3>
                            <p className="text-sm text-muted-foreground mt-1 mb-4">Upgrade your plan to add more than {guestLimit} guests.</p>
                            <Button asChild>
                                <Link href="/owner-dashboard/account">
                                    <CreditCard className="mr-2 h-4 w-4" /> Upgrade Plan
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <Form {...guestForm}>
                            <form onSubmit={guestForm.handleSubmit(handleFormSubmit)} className="space-y-4 pt-4 border-t">
                                <FormField control={guestForm.control} name="name" render={({ field }) => (
                                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g., Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={guestForm.control} name="email" render={({ field }) => (
                                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="jane.doe@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={guestForm.control} name="category" render={({ field }) => (
                                    <FormItem><FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
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
                                <div className="flex gap-2">
                                  {editingGuest && (
                                    <Button type="button" variant="outline" onClick={() => setEditingGuest(null)} className="w-full">
                                      Cancel
                                    </Button>
                                  )}
                                  <Button type="submit" className="w-full" disabled={!selectedEventId || isFormSubmitting}>
                                      {isFormSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : editingGuest ? null : <PlusCircle className="mr-2 h-4 w-4" />}
                                      {isFormSubmitting ? "Saving..." : editingGuest ? "Save Changes" : "Add Guest"}
                                  </Button>
                                </div>
                            </form>
                        </Form>
                    )}
                 </div>
            </CardContent>
        </Card>

         <Card className={cn(
            "transition-opacity",
            (!guests || guests.length === 0) && "opacity-40 pointer-events-none"
        )}>
            <CardHeader>
                <CardTitle>Next Step</CardTitle>
                <CardDescription>Now that you have guests, assemble your team.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild className="w-full">
                    <Link href="/owner-dashboard/team">
                        <Contact className="mr-2 h-4 w-4" />
                        Assemble Your Team
                    </Link>
                </Button>
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
