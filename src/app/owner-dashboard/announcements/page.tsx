
'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { EniChat } from '@/components/ai/eni-chat';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Megaphone } from 'lucide-react';

export default function AnnouncementsPage() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const firestore = useFirestore();
  const { user } = useUser();

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'events'), where('ownerId', '==', user.uid));
  }, [firestore, user?.uid]);

  const { data: events, isLoading } = useCollection<any>(eventsQuery);

  return (
    <div className="space-y-8">
       <header className="pb-4 border-b">
        <div>
            <h1 className="text-3xl font-bold font-headline">Broadcast & Concierge</h1>
            <p className="text-muted-foreground">Manage your event communications with AI assistance.</p>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Step 1: Select Event</CardTitle>
                    <CardDescription>Target an event for Eni to assist with.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Active Event</Label>
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Select onValueChange={setSelectedEventId} value={selectedEventId || ''}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose an event" />
                            </SelectTrigger>
                            <SelectContent>
                                {events?.map((e: any) => (
                                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Megaphone className="h-4 w-4 text-primary" />
                        Quick Commands
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-2">
                    <p>• "Eni, invite all my guests on WhatsApp"</p>
                    <p>• "Draft a celebratory announcement about the cake cutting"</p>
                    <p>• "Who has checked in so far?"</p>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-2">
            <EniChat eventId={selectedEventId || undefined} />
        </div>
      </div>
    </div>
  );
}
