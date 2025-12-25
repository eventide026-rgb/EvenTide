
'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, Trash2, Gift, Banknote } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

type Event = {
  id: string;
  name: string;
  ownerId: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
};

type Gift = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  quantity: number;
  claimedCount: number;
  claimedBy: { guestId: string; guestName: string }[];
};

const giftFormSchema = z.object({
  name: z.string().min(2, 'Gift name is required.'),
  description: z.string().optional(),
  imageUrl: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
  price: z.coerce.number().optional(),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1.'),
});

const bankFormSchema = z.object({
    bankName: z.string().min(2, 'Bank name is required.'),
    accountNumber: z.string().length(10, 'Account number must be 10 digits.'),
    accountName: z.string().min(2, 'Account name is required.'),
});

export default function GiftRegistryPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const giftForm = useForm<z.infer<typeof giftFormSchema>>({
    resolver: zodResolver(giftFormSchema),
    defaultValues: { name: '', description: '', imageUrl: '', price: 0, quantity: 1 },
  });

  const bankForm = useForm<z.infer<typeof bankFormSchema>>({
    resolver: zodResolver(bankFormSchema),
    defaultValues: { bankName: '', accountNumber: '', accountName: '' },
  });

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'events'), where('ownerId', '==', user.uid));
  }, [firestore, user?.uid]);

  const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

  const selectedEvent = events?.find(e => e.id === selectedEventId);

  const giftsQuery = useMemoFirebase(() => {
    if (!firestore || !selectedEventId) return null;
    return query(collection(firestore, 'events', selectedEventId, 'gifts'));
  }, [firestore, selectedEventId]);

  const { data: gifts, isLoading: isLoadingGifts } = useCollection<Gift>(giftsQuery);

  const handleAddGift = async (values: z.infer<typeof giftFormSchema>) => {
    if (!firestore || !selectedEventId) return;
    const giftData = {
        ...values,
        claimedCount: 0,
        claimedBy: [],
        createdAt: new Date()
    };
    await addDoc(collection(firestore, 'events', selectedEventId, 'gifts'), giftData);
    toast({ title: 'Gift Added', description: `${values.name} has been added to the registry.` });
    giftForm.reset();
  };

  const handleUpdateBankDetails = async (values: z.infer<typeof bankFormSchema>) => {
    if (!firestore || !selectedEventId) return;
    const eventRef = doc(firestore, 'events', selectedEventId);
    await updateDoc(eventRef, values);
    toast({ title: 'Bank Details Updated', description: 'Your bank details for monetary gifts have been saved.' });
  }

  const handleDeleteGift = async (giftId: string) => {
    if (!firestore || !selectedEventId) return;
    await deleteDoc(doc(firestore, 'events', selectedEventId, 'gifts', giftId));
    toast({ title: 'Gift Removed', description: 'The gift has been removed from the registry.' });
  };

  const getStatus = (gift: Gift) => {
    if (gift.claimedCount === 0) return <Badge variant="outline">Available</Badge>;
    if (gift.claimedCount < gift.quantity) return <Badge variant="secondary">Partially Claimed</Badge>;
    return <Badge variant="default">Claimed</Badge>;
  }

  const isLoading = isUserLoading || isLoadingEvents;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gift Registry Management</CardTitle>
          <CardDescription>Create and manage a gift registry for your events.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormLabel>Select an Event</FormLabel>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Select onValueChange={setSelectedEventId} value={selectedEventId || ''}>
              <SelectTrigger className="w-full md:w-1/2">
                <SelectValue placeholder="Select an event to manage its registry" />
              </SelectTrigger>
              <SelectContent>
                {events && events.length > 0 ? (
                  events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-events" disabled>You have no events.</SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedEventId && (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5" /> Add a New Gift</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...giftForm}>
                        <form onSubmit={giftForm.handleSubmit(handleAddGift)} className="space-y-4">
                            <div className='grid md:grid-cols-2 gap-4'>
                                <FormField control={giftForm.control} name="name" render={({ field }) => (
                                    <FormItem><FormLabel>Gift Name</FormLabel><FormControl><Input placeholder="e.g., Premium Blender" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={giftForm.control} name="price" render={({ field }) => (
                                    <FormItem><FormLabel>Price (₦, Optional)</FormLabel><FormControl><Input type="number" placeholder="50000" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                             <FormField control={giftForm.control} name="imageUrl" render={({ field }) => (
                                <FormItem><FormLabel>Image URL (Optional)</FormLabel><FormControl><Input placeholder="https://example.com/image.jpg" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={giftForm.control} name="description" render={({ field }) => (
                                <FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Textarea placeholder="Any specific details about the gift..." {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <FormField control={giftForm.control} name="quantity" render={({ field }) => (
                                <FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <Button type="submit" disabled={giftForm.formState.isSubmitting}>
                                {giftForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add to Registry
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Banknote className="h-5 w-5" /> Monetary Gift Details</CardTitle>
                    <CardDescription>Provide bank details for guests who prefer to give cash gifts.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Form {...bankForm}>
                        <form onSubmit={bankForm.handleSubmit(handleUpdateBankDetails)} className="space-y-4">
                            <div className='grid md:grid-cols-2 gap-4'>
                                <FormField control={bankForm.control} name="bankName" render={({ field }) => (
                                    <FormItem><FormLabel>Bank Name</FormLabel><FormControl><Input placeholder="e.g., Guaranty Trust Bank" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={bankForm.control} name="accountNumber" render={({ field }) => (
                                    <FormItem><FormLabel>Account Number</FormLabel><FormControl><Input placeholder="0123456789" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                            <FormField control={bankForm.control} name="accountName" render={({ field }) => (
                                <FormItem><FormLabel>Account Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <Button type="submit" disabled={bankForm.formState.isSubmitting}>
                                {bankForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Bank Details
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Current Registry</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingGifts ? <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" /> : (
                         <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Gift</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Claimed By</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {gifts && gifts.length > 0 ? gifts.map(gift => (
                                        <TableRow key={gift.id}>
                                            <TableCell className="font-medium flex items-center gap-4">
                                                {gift.imageUrl && <Image src={gift.imageUrl} alt={gift.name} width={40} height={40} className="rounded-md object-cover" />}
                                                {gift.name}
                                            </TableCell>
                                            <TableCell>{getStatus(gift)}</TableCell>
                                            <TableCell>
                                                {gift.claimedBy.length > 0 ? gift.claimedBy.map(g => g.guestName).join(', ') : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete this gift from the registry.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteGift(gift.id)}>Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                No gifts have been added to this registry yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                         </div>
                    )}
                </CardContent>
            </Card>
        </>
      )}
    </div>
  );
}
