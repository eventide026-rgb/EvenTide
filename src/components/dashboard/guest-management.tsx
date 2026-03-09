'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import {
  useCollection,
  useDoc,
  useFirestore,
  useUser,
  useMemoFirebase,
} from '@/firebase';
import {
  collection,
  query,
  where,
  doc,
  serverTimestamp,
  orderBy,
  writeBatch,
  updateDoc,
} from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  UserPlus,
  Trash2,
  Edit,
  Smartphone,
  Mail,
} from 'lucide-react';
import { Label } from '../ui/label';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Progress } from '../ui/progress';
import type { Guest } from '@/lib/types';

type Event = {
  id: string;
  name: string;
  ownerId: string;
  guestCount?: number;
  guestLimit?: number;
  eventCode?: string;
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
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  const guestForm = useForm<z.infer<typeof guestFormSchema>>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      category: 'General',
    },
  });

  const ownerEventsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(
      collection(firestore, 'events'),
      where('ownerId', '==', user.uid)
    );
  }, [firestore, user?.uid]);
  const { data: ownerEvents } = useCollection<Event>(ownerEventsQuery);

  const plannerManagedEventsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(
      collection(firestore, 'events'),
      where('plannerIds', 'array-contains', user.uid)
    );
  }, [firestore, user?.uid]);
  const { data: plannerEvents } = useCollection<Event>(plannerManagedEventsQuery);

  const events = useMemo(() => {
    const allEvents = [...(ownerEvents || []), ...(plannerEvents || [])];
    const uniqueEvents = Array.from(
      new Map(allEvents.map((e) => [e.id, e])).values()
    );
    return uniqueEvents;
  }, [ownerEvents, plannerEvents]);

  const selectedEventRef = useMemoFirebase(() => {
    if (!firestore || !selectedEventId) return null;
    return doc(firestore, 'events', selectedEventId);
  }, [firestore, selectedEventId]);

  const { data: selectedEvent } = useDoc<Event>(selectedEventRef);

  const guestsQuery = useMemoFirebase(() => {
    if (!firestore || !selectedEventId) return null;
    return query(
      collection(firestore, 'events', selectedEventId, 'guests'),
      orderBy('name')
    );
  }, [firestore, selectedEventId]);

  const { data: guests, isLoading: isLoadingGuests } = useCollection<Guest>(guestsQuery);

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
  const capacityPercentage = guestLimit > 0 ? (guestCount / guestLimit) * 100 : 0;

  const handleAddGuest = async (values: z.infer<typeof guestFormSchema>) => {
    if (!firestore || !selectedEventId || !selectedEvent) return;

    if (guestCount >= guestLimit) {
      toast({ variant: 'destructive', title: 'Guest Limit Reached', description: "You have reached your plan's guest limit." });
      return;
    }

    const guestCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const batch = writeBatch(firestore);
    
    const guestColRef = collection(firestore, 'events', selectedEventId, 'guests');
    const guestDocRef = doc(guestColRef);
    const guestCodeLookupRef = doc(firestore, 'events', selectedEventId, 'guestCodes', guestCode);

    const newGuestData = {
      id: guestDocRef.id,
      eventId: selectedEventId,
      guestCode: guestCode,
      name: values.name,
      email: values.email,
      phoneNumber: values.phoneNumber || '',
      category: values.category,
      rsvpStatus: 'Pending' as const,
      hasCheckedIn: false,
      createdAt: serverTimestamp(),
      serialNumber: guestCount + 1,
    };

    batch.set(guestDocRef, newGuestData);
    batch.set(guestCodeLookupRef, { guestId: guestDocRef.id });

    try {
        await batch.commit();
        toast({ title: 'Guest Added', description: `${values.name} added successfully.` });
        
        // Multi-channel Notification Integration (SMS, WhatsApp & Email)
        const portalUrl = `https://eventide.app/e/${selectedEvent.eventCode}`;
        const message = `Welcome to ${selectedEvent.name}! 🎉 Your Event Code is ${selectedEvent.eventCode} and your unique Guest Code is ${guestCode}. Access your digital gatepass at ${portalUrl}`;
        
        fetch('/api/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                phone: values.phoneNumber, 
                email: values.email,
                subject: `Your Official Invitation to ${selectedEvent.name}`,
                message
            }),
        }).catch(err => console.error("Notification pipeline failed:", err));

        guestForm.reset();
    } catch (err) {
        console.error("Error adding guest:", err);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `events/${selectedEventId}/guests/${guestDocRef.id}`,
          operation: 'create',
          requestResourceData: newGuestData
        }));
    }
  };

  const handleUpdateGuest = async (values: z.infer<typeof guestFormSchema>) => {
    if (!firestore || !selectedEventId || !editingGuest) return;

    const guestRef = doc(firestore, 'events', selectedEventId, 'guests', editingGuest.id);
    const updateData = {
        name: values.name,
        email: values.email,
        phoneNumber: values.phoneNumber || '',
        category: values.category,
    };

    try {
        await updateDoc(guestRef, updateData);
        toast({ title: 'Guest Updated' });
        setEditingGuest(null);
    } catch (err) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: guestRef.path,
          operation: 'update',
          requestResourceData: updateData
        }));
    }
  };

  const handleDeleteGuest = async (guest: Guest) => {
    if (!firestore || !selectedEventId) return;

    const batch = writeBatch(firestore);
    const guestRef = doc(firestore, 'events', selectedEventId, 'guests', guest.id);
    const guestCodeLookupRef = doc(firestore, 'events', selectedEventId, 'guestCodes', guest.guestCode);

    batch.delete(guestRef);
    batch.delete(guestCodeLookupRef);

    try {
        await batch.commit();
        toast({ title: 'Guest Removed' });
    } catch (err) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: guestRef.path,
          operation: 'delete'
        }));
    }
  };

  const handleFormSubmit = (values: z.infer<typeof guestFormSchema>) => {
    if (editingGuest) {
      handleUpdateGuest(values);
    } else {
      handleAddGuest(values);
    }
  };

  const isFormSubmitting = guestForm.formState.isSubmitting;

  return (
    <div className="grid md:grid-cols-3 gap-8 items-start">
      <div className="md:col-span-2 flex flex-col gap-6">
        {selectedEvent && (
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Event Capacity</CardTitle>
              <CardDescription>{guestCount} of {guestLimit} spots filled.</CardDescription>
            </CardHeader>
            <CardContent><Progress value={capacityPercentage} className="h-2" /></CardContent>
          </Card>
        )}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Guest Roster</CardTitle>
            <CardDescription>
              {selectedEvent ? `Showing guests for "${selectedEvent.name}"` : 'Select an event to see the guest list.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingGuests && selectedEventId ? (
              <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : guests && guests.length > 0 ? (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-bold">Name</TableHead>
                      <TableHead className="font-bold">Code</TableHead>
                      <TableHead className="font-bold">Category</TableHead>
                      <TableHead className="font-bold">RSVP</TableHead>
                      <TableHead className="text-right font-bold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guests.map((guest) => (
                      <TableRow key={guest.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{guest.name}</TableCell>
                        <TableCell><Badge variant="secondary" className="font-mono">{guest.guestCode}</Badge></TableCell>
                        <TableCell><Badge variant="outline">{guest.category}</Badge></TableCell>
                        <TableCell>{guest.rsvpStatus}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => setEditingGuest(guest)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteGuest(guest)}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-20 border-2 border-dashed rounded-3xl opacity-50">
                <UserPlus className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-headline font-bold">Your guest list is empty</h3>
                <p className="text-sm text-muted-foreground mt-1">Start adding guests to see them in your roster.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-1 space-y-6">
        <Card className="border-none shadow-xl bg-gradient-to-br from-primary/5 to-background">
          <CardHeader><CardTitle className="font-headline">{editingGuest ? 'Edit Guest' : 'Add New Guest'}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Target Event</Label>
                <Select onValueChange={setSelectedEventId} value={selectedEventId || ''}>
                    <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Choose event" /></SelectTrigger>
                    <SelectContent>
                      {events?.map((event) => (<SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>))}
                    </SelectContent>
                </Select>
              </div>
              <Form {...guestForm}>
                <form onSubmit={guestForm.handleSubmit(handleFormSubmit)} className="space-y-5 pt-4 border-t">
                    <FormField control={guestForm.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel className="font-bold">Full Name</FormLabel><FormControl><Input placeholder="e.g., Jane Doe" className="rounded-xl h-11" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={guestForm.control} name="email" render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-primary" />
                                <FormLabel className="font-bold">Email</FormLabel>
                            </div>
                            <FormControl><Input type="email" placeholder="jane@example.com" className="rounded-xl h-11" {...field} /></FormControl>
                            <FormDescription className="text-[10px]">Guest receives a professional invitation.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={guestForm.control} name="phoneNumber" render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center gap-2">
                                <Smartphone className="h-4 w-4 text-primary" />
                                <FormLabel className="font-bold">Phone Number</FormLabel>
                            </div>
                            <FormControl><Input placeholder="+234..." className="rounded-xl h-11" {...field} /></FormControl>
                            <FormDescription className="text-[10px]">Required for SMS/WhatsApp alerts.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={guestForm.control} name="category" render={({ field }) => (
                        <FormItem><FormLabel className="font-bold">Guest Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Category" /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="Chairperson">Chairperson</SelectItem>
                              <SelectItem value="VVIP">VVIP</SelectItem>
                              <SelectItem value="VIP">VIP</SelectItem>
                              <SelectItem value="Family">Family</SelectItem>
                              <SelectItem value="General">General</SelectItem>
                              <SelectItem value="Staff">Staff</SelectItem>
                            </SelectContent>
                          </Select>
                        <FormMessage /></FormItem>
                    )}/>
                    <div className="flex gap-3 pt-2">
                      {editingGuest && <Button type="button" variant="ghost" onClick={() => setEditingGuest(null)} className="w-full rounded-xl">Cancel</Button>}
                      <Button type="submit" className="w-full rounded-xl h-12 font-bold shadow-lg" disabled={!selectedEventId || isFormSubmitting}>
                        {isFormSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                        {editingGuest ? 'Save Changes' : 'Add to List'}
                      </Button>
                    </div>
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
    <Suspense fallback={<div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
      <GuestManagementComponent />
    </Suspense>
  );
}
