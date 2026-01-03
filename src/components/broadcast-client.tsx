
'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';
import { Label } from './ui/label';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from './ui/badge';

type Event = {
  id: string;
  name: string;
  ownerId: string;
};

type Announcement = {
    id: string;
    content: string;
    authorName: string;
    authorRole: string;
    targetGroup: string;
    timestamp: any;
};

const broadcastFormSchema = z.object({
  content: z.string().min(5, 'Announcement must be at least 5 characters long.'),
  targetGroup: z.string().default('All Guests'),
});

export function BroadcastClient() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof broadcastFormSchema>>({
    resolver: zodResolver(broadcastFormSchema),
    defaultValues: { content: '', targetGroup: 'All Guests' },
  });

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'events'), where('ownerId', '==', user.uid));
  }, [firestore, user?.uid]);

  const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

  const announcementsQuery = useMemoFirebase(() => {
    if (!firestore || !selectedEventId) return null;
    return query(collection(firestore, 'events', selectedEventId, 'announcements'), orderBy('timestamp', 'desc'));
  }, [firestore, selectedEventId]);

  const { data: announcements, isLoading: isLoadingAnnouncements } = useCollection<Announcement>(announcementsQuery);

  const handleSendBroadcast = async (values: z.infer<typeof broadcastFormSchema>) => {
    if (!firestore || !user || !selectedEventId) return;

    const announcementData = {
        eventId: selectedEventId,
        authorId: user.uid,
        authorName: user.displayName || user.email,
        authorRole: 'Owner', // This should be dynamic based on user role
        content: values.content,
        targetGroup: values.targetGroup,
        targetRoles: values.targetGroup === 'All Guests' ? ['All Guests'] : [values.targetGroup], // Simplified
        timestamp: serverTimestamp(),
    };

    try {
        await addDoc(collection(firestore, 'events', selectedEventId, 'announcements'), announcementData);
        toast({ title: 'Broadcast Sent!', description: 'Your announcement has been sent to the selected guests.' });
        form.reset();
    } catch (error) {
        console.error('Error sending announcement:', error);
        toast({ variant: 'destructive', title: 'Failed to Send', description: 'Could not send the announcement.' });
    }
  };

  const isLoading = isUserLoading || isLoadingEvents;
  const isFormSubmitting = form.formState.isSubmitting;

  return (
    <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Announcement Log</CardTitle>
                    <CardDescription>History of all broadcasts sent for the selected event.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingAnnouncements && selectedEventId ? (
                        <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : announcements && announcements.length > 0 ? (
                        <ul className="space-y-4">
                            {announcements.map(ann => (
                                <li key={ann.id} className="border p-4 rounded-lg">
                                    <p>{ann.content}</p>
                                    <div className="text-xs text-muted-foreground mt-2 flex items-center justify-between">
                                        <span>From {ann.authorName} ({ann.authorRole})</span>
                                        <span>{formatDistanceToNow(ann.timestamp.toDate(), { addSuffix: true })}</span>
                                    </div>
                                    <Badge variant="outline" className="mt-2">{ann.targetGroup}</Badge>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-16 border-dashed border-2 rounded-lg">
                            <p className="text-muted-foreground">No announcements sent for this event yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>New Broadcast</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <Label>Select Event</Label>
                            {isLoading ? (
                                <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /><span>Loading events...</span></div>
                            ) : (
                                <Select onValueChange={setSelectedEventId} value={selectedEventId || ''}>
                                    <SelectTrigger><SelectValue placeholder="Choose an event" /></SelectTrigger>
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
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSendBroadcast)} className="space-y-4 pt-4 border-t">
                                <FormField control={form.control} name="targetGroup" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Audience</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedEventId}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="All Guests">All Guests</SelectItem>
                                                <SelectItem value="VIP">VIP</SelectItem>
                                                <SelectItem value="VVIP">VVIP</SelectItem>
                                                <SelectItem value="Family">Family</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="content" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Message</FormLabel>
                                        <FormControl><Textarea rows={5} placeholder="e.g., Dinner is now being served in the main hall." {...field} disabled={!selectedEventId} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <Button type="submit" className="w-full" disabled={!selectedEventId || isFormSubmitting}>
                                    {isFormSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    {isFormSubmitting ? "Sending..." : "Send Broadcast"}
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
