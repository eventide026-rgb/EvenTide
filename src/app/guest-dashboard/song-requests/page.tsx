
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Music, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type SongRequest = {
  id: string;
  songTitle: string;
  artist: string;
  requesterName: string;
  status: 'pending' | 'approved' | 'rejected';
};

const requestFormSchema = z.object({
  songTitle: z.string().min(2, 'Song title is required.'),
  artist: z.string().min(2, 'Artist name is required.'),
});

export default function SongRequestsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [eventId, setEventId] = useState<string | null>(null);
  const [guestName, setGuestName] = useState<string | null>(null);

  useEffect(() => {
    setEventId(sessionStorage.getItem('guestEventId'));
    setGuestName(sessionStorage.getItem('guestName'));
  }, []);

  const form = useForm<z.infer<typeof requestFormSchema>>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: { songTitle: '', artist: '' },
  });

  const myRequestsQuery = useMemoFirebase(() => {
    if (!firestore || !eventId || !user) return null;
    return query(
        collection(firestore, 'events', eventId, 'songRequests'),
        where('requesterId', '==', user.uid),
        orderBy('createdAt', 'desc')
    );
  }, [firestore, eventId, user]);

  const { data: myRequests, isLoading: isLoadingRequests } = useCollection<SongRequest>(myRequestsQuery);

  const handleSubmitRequest = async (values: z.infer<typeof requestFormSchema>) => {
    if (!firestore || !eventId || !user || !guestName) return;

    const requestData = {
        ...values,
        eventId,
        requesterId: user.uid,
        requesterName: guestName,
        status: 'pending' as const,
        createdAt: serverTimestamp(),
    };
    await addDoc(collection(firestore, 'events', eventId, 'songRequests'), requestData);
    toast({ title: 'Request Sent!', description: `"${values.songTitle}" has been sent to the host for approval.` });
    form.reset();
  };

  const getStatusBadge = (status: SongRequest['status']) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const isLoading = isUserLoading || !eventId;

  return (
    <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>My Requests</CardTitle>
                    <CardDescription>Track the status of your song requests.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingRequests ? (
                        <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : myRequests && myRequests.length > 0 ? (
                        <ul className="space-y-3">
                            {myRequests.map(req => (
                                <li key={req.id} className="flex justify-between items-center border p-3 rounded-md">
                                    <div>
                                        <p className="font-semibold">{req.songTitle}</p>
                                        <p className="text-sm text-muted-foreground">{req.artist}</p>
                                    </div>
                                    {getStatusBadge(req.status)}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-16 border-dashed border-2 rounded-lg">
                            <Music className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-2 text-muted-foreground">You haven't requested any songs yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
         <div className="md:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Request a Song</CardTitle>
                </CardHeader>
                <CardContent>
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmitRequest)} className="space-y-4">
                             <FormField control={form.control} name="songTitle" render={({ field }) => (
                                <FormItem><FormLabel>Song Title</FormLabel><FormControl><Input placeholder="e.g., Water" {...field} disabled={isLoading} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="artist" render={({ field }) => (
                                <FormItem><FormLabel>Artist</FormLabel><FormControl><Input placeholder="e.g., Tyla" {...field} disabled={isLoading} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <Button type="submit" className="w-full" disabled={isLoading || form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                                Submit Request
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
