
'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Megaphone, Smartphone, Mail } from 'lucide-react';
import { Label } from './ui/label';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Skeleton } from './ui/skeleton';

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

type Guest = {
    id: string;
    email?: string;
    phoneNumber?: string;
    category: string;
}

const broadcastFormSchema = z.object({
  content: z.string().min(5, 'Announcement must be at least 5 characters long.'),
  targetGroup: z.string().default('All Guests'),
  sendToMobile: z.boolean().default(false),
});

export function BroadcastClient() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof broadcastFormSchema>>({
    resolver: zodResolver(broadcastFormSchema),
    defaultValues: { content: '', targetGroup: 'All Guests', sendToMobile: false },
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

  const guestsQuery = useMemoFirebase(() => {
      if (!firestore || !selectedEventId) return null;
      return query(collection(firestore, 'events', selectedEventId, 'guests'));
  }, [firestore, selectedEventId]);
  const { data: guests } = useCollection<Guest>(guestsQuery);

  const handleSendBroadcast = async (values: z.infer<typeof broadcastFormSchema>) => {
    if (!firestore || !user || !selectedEventId) return;

    const eventName = events?.find(e => e.id === selectedEventId)?.name || 'Event';
    const announcementData = {
        eventId: selectedEventId,
        authorId: user.uid,
        authorName: user.displayName || user.email,
        authorRole: 'Owner',
        content: values.content,
        targetGroup: values.targetGroup,
        targetRoles: values.targetGroup === 'All Guests' ? ['All Guests'] : [values.targetGroup],
        timestamp: serverTimestamp(),
    };

    try {
        await addDoc(collection(firestore, 'events', selectedEventId, 'announcements'), announcementData);
        
        if (values.sendToMobile && guests) {
            const targetGuests = values.targetGroup === 'All Guests' 
                ? guests 
                : guests.filter(g => g.category === values.targetGroup);
            
            // Push to all identified targets across channels
            targetGuests.forEach(guest => {
                if (guest.phoneNumber || guest.email) {
                    fetch('/api/notify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            phoneNumber: guest.phoneNumber,
                            email: guest.email,
                            subject: `Urgent Update: ${eventName}`,
                            message: values.content,
                            htmlContent: `
                                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                                    <h3 style="color: #4169E1; margin-top: 0;">Update for ${eventName}</h3>
                                    <p style="font-size: 16px; line-height: 1.6;">${values.content}</p>
                                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                                    <p style="font-size: 12px; color: #64748b;">This message was sent via EvenTide Live Broadcast.</p>
                                </div>
                            `
                        }),
                    }).catch(err => console.error("Broadcast delivery failed for recipient:", guest.id, err));
                }
            });
            
            toast({ title: 'Broadcast Distributed', description: `Alerts pushed to ${targetGuests.length} guests.` });
        }

        toast({ title: 'Broadcast Published', description: 'Your announcement is now live.' });
        form.reset({ ...form.getValues(), content: '' });
    } catch (error) {
        console.error('Error sending announcement:', error);
        toast({ variant: 'destructive', title: 'Failed to Send' });
    }
  };

  const isLoading = isUserLoading || isLoadingEvents;
  const isFormSubmitting = form.formState.isSubmitting;

  return (
    <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2">
            <Card className="border-none shadow-lg">
                <CardHeader className="bg-muted/10 border-b">
                    <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-primary"/> Broadcast Log</CardTitle>
                    <CardDescription>Real-time feed of all updates sent to participants.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    {isLoadingAnnouncements && selectedEventId ? (
                        <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : announcements && announcements.length > 0 ? (
                        <ul className="space-y-4">
                            {announcements.map(ann => (
                                <li key={ann.id} className="border p-4 rounded-2xl bg-muted/20 relative group">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className="bg-background/50 border-primary/20">{ann.targetGroup}</Badge>
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{formatDistanceToNow(ann.timestamp.toDate(), { addSuffix: true })}</span>
                                    </div>
                                    <p className="text-sm leading-relaxed">{ann.content}</p>
                                    <p className="text-[10px] text-muted-foreground mt-2 font-bold">— {ann.authorName}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed rounded-3xl opacity-50">
                            <Megaphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">The announcement log is empty.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-1">
            <Card className="border-none shadow-xl bg-gradient-to-br from-primary/5 to-background">
                <CardHeader>
                    <CardTitle>Instant Broadcast</CardTitle>
                    <CardDescription>Push updates to the live feed, mobile devices, and email.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Target Event</Label>
                            {isLoading ? (
                                <Skeleton className="h-10 w-full rounded-xl" />
                            ) : (
                                <Select onValueChange={setSelectedEventId} value={selectedEventId || ''}>
                                    <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Choose event" /></SelectTrigger>
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
                            <form onSubmit={form.handleSubmit(handleSendBroadcast)} className="space-y-6">
                                <FormField control={form.control} name="targetGroup" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Target Audience</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedEventId}>
                                            <FormControl><SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="All Guests">All Guests</SelectItem>
                                                <SelectItem value="VIP">VIPs Only</SelectItem>
                                                <SelectItem value="Staff">Staff Only</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="content" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Message</FormLabel>
                                        <FormControl><Textarea rows={4} className="rounded-2xl resize-none" placeholder="What's happening now?" {...field} disabled={!selectedEventId} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                
                                <FormField control={form.control} name="sendToMobile" render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-2xl border p-4 bg-background/50">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <Smartphone className="h-4 w-4 text-primary" />
                                                <FormLabel className="text-sm font-bold">Omni-Channel Push</FormLabel>
                                            </div>
                                            <FormDescription className="text-[10px] flex items-center gap-1">
                                                <Smartphone className="h-3 w-3"/> SMS/WA + <Mail className="h-3 w-3"/> Email
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} disabled={!selectedEventId} />
                                        </FormControl>
                                    </FormItem>
                                )}/>

                                <Button type="submit" className="w-full rounded-2xl h-12 font-bold shadow-lg" disabled={!selectedEventId || isFormSubmitting}>
                                    {isFormSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    {isFormSubmitting ? "Pushing..." : "Send Broadcast"}
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
