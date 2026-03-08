
'use client';

import { use, useState, useMemo, useEffect } from 'react';
import { useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, query, orderBy, limit, updateDoc } from 'firebase/firestore';
import { 
    Loader2, 
    CircleCheck, 
    Users, 
    Calendar, 
    Music, 
    Image as ImageIcon, 
    Megaphone, 
    Activity,
    ArrowLeft,
    MonitorPlay,
    CirclePlay,
    CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { BroadcastClient } from '@/components/broadcast-client';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type Event = {
    id: string;
    name: string;
    eventCode: string;
    eventType: string;
};

type Guest = {
    id: string;
    name: string;
    hasCheckedIn: boolean;
    checkInTime: any;
    category: string;
};

type ProgramItem = {
    id: string;
    title: string;
    startTime: string;
    status: 'Upcoming' | 'In Progress' | 'Completed';
};

type Media = {
    id: string;
    fileUrl: string;
};

type SongRequest = {
    id: string;
    songTitle: string;
    artist: string;
    status: 'pending' | 'approved' | 'rejected';
};

export default function EventLiveDashboard({ params }: { params: Promise<{ eventId: string }> }) {
    const { eventId } = use(params);
    const firestore = useFirestore();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('timeline');

    // 1. Event Data
    const eventRef = useMemoFirebase(() => doc(firestore, 'events', eventId), [firestore, eventId]);
    const { data: event, isLoading: isLoadingEvent } = useDoc<Event>(eventRef);

    // 2. Real-time Guest Stream
    const guestsQuery = useMemoFirebase(() => query(collection(firestore, 'events', eventId, 'guests')), [firestore, eventId]);
    const { data: guests, isLoading: isLoadingGuests } = useCollection<Guest>(guestsQuery);

    // 3. Real-time Program Stream
    const programQuery = useMemoFirebase(() => query(
        collection(firestore, 'events', eventId, 'program', 'main', 'items'), 
        orderBy('startTime', 'asc')
    ), [firestore, eventId]);
    const { data: program, isLoading: isLoadingProgram } = useCollection<ProgramItem>(programQuery);

    // 4. Live Media Stream
    const mediaQuery = useMemoFirebase(() => query(
        collection(firestore, 'events', eventId, 'media'), 
        orderBy('uploadTimestamp', 'desc'),
        limit(12)
    ), [firestore, eventId]);
    const { data: media, isLoading: isLoadingMedia } = useCollection<Media>(mediaQuery);

    // 5. Engagement Stream (Song Requests)
    const requestsQuery = useMemoFirebase(() => query(
        collection(firestore, 'events', eventId, 'songRequests'),
        orderBy('createdAt', 'desc'),
        limit(10)
    ), [firestore, eventId]);
    const { data: requests, isLoading: isLoadingRequests } = useCollection<SongRequest>(requestsQuery);

    // Derived Metrics
    const checkedInCount = guests?.filter(g => g.hasCheckedIn)?.length || 0;
    const totalGuests = guests?.length || 0;
    const checkInRate = totalGuests > 0 ? Math.round((checkedInCount / totalGuests) * 100) : 0;

    const currentItem = program?.find(p => p.status === 'In Progress');
    const nextItem = program?.find(p => p.status === 'Upcoming');

    const handleStartProgramItem = async (itemId: string) => {
        if (!program) return;
        const batch = program.map(item => {
            const itemRef = doc(firestore, 'events', eventId, 'program', 'main', 'items', item.id);
            if (item.id === itemId) {
                return updateDoc(itemRef, { status: 'In Progress' });
            } else if (item.status === 'In Progress') {
                return updateDoc(itemRef, { status: 'Completed' });
            }
            return Promise.resolve();
        });
        
        try {
            await Promise.all(batch);
            toast({ title: "Timeline Updated", description: "The live program status has been updated for all guests." });
        } catch (e) {
            toast({ variant: 'destructive', title: "Update Failed" });
        }
    };

    if (isLoadingEvent) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!event) return <div>Event not found.</div>;

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* Live Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-background/60 backdrop-blur-xl p-6 rounded-3xl border shadow-xl sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full">
                        <Link href={`/owner/events/${eventId}`}><ArrowLeft className="h-5 w-5" /></Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-headline font-bold text-center md:text-left">{event.name}</h1>
                            <Badge variant="outline" className="animate-pulse bg-red-500/10 text-red-500 border-red-500/20">
                                <MonitorPlay className="h-3 w-3 mr-1" /> LIVE
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono uppercase tracking-widest text-center md:text-left">{event.eventCode}</p>
                    </div>
                </div>
                <div className="flex items-center justify-center md:justify-end gap-2">
                    <Button variant="secondary" className="rounded-full shadow-inner" asChild>
                        <Link href={`/owner/checkin-monitor?eventId=${eventId}`}>Full Manifest</Link>
                    </Button>
                    <Button variant="outline" className="rounded-full" asChild>
                        <Link href={`/owner/events/${eventId}/photo-wall`} target="_blank">Project Wall</Link>
                    </Button>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-primary/10 to-background border-none shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-2 opacity-10"><Users className="h-12 w-12"/></div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-center md:text-left">Check-ins</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center md:text-left">
                        <div className="text-3xl font-bold">{checkedInCount} / {totalGuests}</div>
                        <p className="text-xs text-muted-foreground mt-1">{checkInRate}% attendance rate</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-muted/30">
                    <CardHeader className="pb-2 text-center md:text-left">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Now Playing</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center md:text-left">
                        <div className="text-lg font-bold line-clamp-1">{currentItem?.title || "Intermission"}</div>
                        <p className="text-xs text-muted-foreground mt-1">Started at {currentItem?.startTime || "--:--"}</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-muted/30">
                    <CardHeader className="pb-2 text-center md:text-left">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Up Next</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center md:text-left">
                        <div className="text-lg font-bold line-clamp-1">{nextItem?.title || "TBD"}</div>
                        <p className="text-xs text-muted-foreground mt-1">Scheduled for {nextItem?.startTime || "--:--"}</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-muted/30">
                    <CardHeader className="pb-2 text-center md:text-left">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Engagement</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center md:text-left">
                        <div className="text-3xl font-bold">{requests?.length || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Pending song requests</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Dashboard Tabs */}
                <div className="lg:col-span-2 space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="w-full grid grid-cols-4 h-12 bg-muted/50 rounded-2xl p-1">
                            <TabsTrigger value="timeline" className="rounded-xl font-bold text-xs">Timeline</TabsTrigger>
                            <TabsTrigger value="guests" className="rounded-xl font-bold text-xs">Guests</TabsTrigger>
                            <TabsTrigger value="gallery" className="rounded-xl font-bold text-xs">Gallery</TabsTrigger>
                            <TabsTrigger value="engagement" className="rounded-xl font-bold text-xs">Interact</TabsTrigger>
                        </TabsList>

                        <TabsContent value="timeline" className="mt-6">
                            <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
                                <CardHeader className="bg-muted/30 border-b">
                                    <CardTitle className="flex items-center justify-center md:justify-start gap-2"><Calendar className="h-5 w-5 text-primary" /> Live Program</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {isLoadingProgram ? <Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /> : (
                                        <div className="space-y-4">
                                            {program?.map((item) => (
                                                <div key={item.id} className={cn(
                                                    "flex items-center justify-between p-4 rounded-2xl border transition-all",
                                                    item.status === 'In Progress' ? "bg-primary/5 border-primary shadow-inner" : "bg-transparent"
                                                )}>
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs",
                                                            item.status === 'In Progress' ? "bg-primary text-primary-foreground animate-pulse" : "bg-muted text-muted-foreground"
                                                        )}>
                                                            {item.startTime}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold">{item.title}</p>
                                                            <Badge variant={item.status === 'In Progress' ? 'default' : 'secondary'} className="text-[10px] h-4">
                                                                {item.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    {item.status === 'Upcoming' && (
                                                        <Button size="sm" variant="outline" className="rounded-full" onClick={() => handleStartProgramItem(item.id)}>
                                                            <CirclePlay className="h-4 w-4 mr-2" /> Start Now
                                                        </Button>
                                                    )}
                                                    {item.status === 'In Progress' && (
                                                        <Badge className="bg-primary/20 text-primary border-primary/20 animate-pulse">LIVE NOW</Badge>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="guests" className="mt-6">
                            <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
                                <CardHeader className="bg-muted/30 border-b">
                                    <CardTitle className="flex items-center justify-center md:justify-start gap-2"><Users className="h-5 w-5 text-primary" /> Recent Arrivals</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    {guests?.filter(g => g.hasCheckedIn).slice(0, 10).map(guest => (
                                        <div key={guest.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                                    <CircleCheck className="h-4 w-4 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">{guest.name}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{guest.category}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-muted-foreground font-mono">
                                                {guest.checkInTime ? format(guest.checkInTime.toDate(), 'HH:mm') : '--:--'}
                                            </span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="gallery" className="mt-6">
                            <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
                                <CardHeader className="bg-muted/30 border-b">
                                    <CardTitle className="flex items-center justify-center md:justify-start gap-2"><ImageIcon className="h-5 w-5 text-primary" /> Live Photo Stream</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {media?.map((m) => (
                                            <div key={m.id} className="aspect-square relative rounded-xl overflow-hidden shadow-sm hover:scale-105 transition-transform">
                                                <Image src={m.fileUrl} alt="Live photo" fill className="object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="outline" className="w-full mt-6 rounded-xl" asChild>
                                        <Link href={`/owner/media-library`}>View Full Library</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="engagement" className="mt-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <Card className="border-none shadow-lg rounded-3xl">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-center md:text-left"><Music className="h-5 w-5 text-primary" /> Song Queue</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {requests?.map(req => (
                                            <div key={req.id} className="flex items-center justify-between p-2 rounded-lg border bg-muted/10">
                                                <div className="text-xs">
                                                    <p className="font-bold">{req.songTitle}</p>
                                                    <p className="text-muted-foreground">{req.artist}</p>
                                                </div>
                                                <Badge variant={req.status === 'approved' ? 'default' : 'outline'}>{req.status}</Badge>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                                <Card className="border-none shadow-lg rounded-3xl">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-center md:text-left"><Activity className="h-5 w-5 text-primary" /> Poll Engagement</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex flex-col items-center justify-center h-48 text-center">
                                        <Activity className="h-8 w-8 text-muted-foreground mb-2 opacity-20" />
                                        <p className="text-sm text-muted-foreground">Live polling results will appear here as guests vote.</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Broadcast Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-gradient-to-b from-primary to-primary/90 text-primary-foreground">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5" /> Instant Broadcast</CardTitle>
                            <CardDescription className="text-primary-foreground/70">Send urgent updates or celebratory notes to everyone.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BroadcastClient />
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b">
                            <CardTitle className="text-base text-center md:text-left">Quick Coordination</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-2 text-center md:text-left">
                            <Button variant="outline" className="w-full justify-start rounded-xl" asChild>
                                <Link href={`/owner/chat`}><ImageIcon className="mr-2 h-4 w-4" /> Team Group Chat</Link>
                            </Button>
                            <Button variant="outline" className="w-full justify-start rounded-xl" asChild>
                                <Link href={`/owner/team`}><Users className="mr-2 h-4 w-4" /> Vendor Shortcuts</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
