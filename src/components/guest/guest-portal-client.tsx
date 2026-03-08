'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, limit, doc, serverTimestamp, addDoc, updateDoc, increment, arrayUnion, orderBy, onSnapshot } from 'firebase/firestore';
import { Loader2, Music, Image as ImageIcon, Calendar, Gift, Vote, PenSquare, UserCheck, MapPin, Sparkles, Send, Clock, CirclePlay, ArrowRightCircle, Megaphone, History } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format, isPast } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { ProgramPreviewCard } from '../stationery/previews/program-preview';
import { MenuPreviewCard } from '../stationery/previews/menu-preview';
import { ImageUploader } from '../image-uploader';
import { Progress } from '../ui/progress';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';

type Event = {
    id: string;
    name: string;
    description: string;
    eventDate: any;
    location: string;
    eventType: string;
    primaryColor: string;
    secondaryColor: string;
};

type Guest = {
    id: string;
    name: string;
    category: string;
    guestCode: string;
    hasCheckedIn: boolean;
};

type ProgramItem = {
    id: string;
    title: string;
    startTime: string;
    status: 'Upcoming' | 'In Progress' | 'Completed';
}

type Poll = {
    id: string;
    question: string;
    options: { text: string; votes: number }[];
    totalVotes: number;
    voters: string[];
};

type Autograph = {
    id: string;
    guestName: string;
    message: string;
    createdAt: any;
};

type Announcement = {
    id: string;
    content: string;
    authorName: string;
    timestamp: any;
}

type Media = {
    id: string;
    fileUrl: string;
}

export function GuestPortalClient({ eventCode }: { eventCode: string }) {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();
    
    const [event, setEvent] = useState<Event | null>(null);
    const [guest, setGuest] = useState<Guest | null>(null);
    const [isLoadingEvent, setIsLoadingEvent] = useState(true);
    const [activeTab, setActiveTab] = useState('program');
    
    const [lookupCode, setLookupCode] = useState('');
    const [isIdentifying, setIsIdentifying] = useState(false);

    const [autographMsg, setAutographMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEnded = useMemo(() => event?.eventDate ? isPast(event.eventDate.toDate()) : false, [event]);

    // Live Announcements Listener
    useEffect(() => {
        if (!event?.id || !firestore || isEnded) return;

        const announcementsRef = collection(firestore, 'events', event.id, 'announcements');
        const q = query(announcementsRef, orderBy('timestamp', 'desc'), limit(1));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    const data = change.doc.data() as Announcement;
                    if (data.timestamp?.toMillis) {
                        const isRecent = (Date.now() - data.timestamp.toMillis() < 30000);
                        if (isRecent) {
                            toast({
                                title: "EVENT ANNOUNCEMENT",
                                description: data.content,
                                duration: 10000,
                            });
                        }
                    }
                }
            });
        });

        return () => unsubscribe();
    }, [event?.id, firestore, toast, isEnded]);

    useEffect(() => {
        const fetchEvent = async () => {
            if (!firestore) return;
            const q = query(collection(firestore, 'events'), where('eventCode', '==', eventCode), limit(1));
            const snap = await getDocs(q);
            if (!snap.empty) {
                const doc = snap.docs[0];
                setEvent({ id: doc.id, ...doc.data() } as Event);
            }
            setIsLoadingEvent(false);
        };
        fetchEvent();
    }, [firestore, eventCode]);

    const handleIdentify = async () => {
        if (!event || !lookupCode) return;
        setIsIdentifying(true);
        try {
            const q = query(collection(firestore, 'events', event.id, 'guests'), where('guestCode', '==', lookupCode.trim().toUpperCase()), limit(1));
            const snap = await getDocs(q);
            if (!snap.empty) {
                const gData = { id: snap.docs[0].id, ...snap.docs[0].data() } as Guest;
                setGuest(gData);
                sessionStorage.setItem(`guest_id_${eventCode}`, gData.id);
                toast({ title: `Welcome, ${gData.name}!` });
            } else {
                toast({ variant: 'destructive', title: "Invalid Code" });
            }
        } finally {
            setIsIdentifying(false);
        }
    };

    const programQuery = useMemoFirebase(() => event ? query(
        collection(firestore, 'events', event.id, 'program', 'main', 'items'), 
        orderBy('startTime', 'asc')
    ) : null, [event, firestore]);
    const { data: program } = useCollection<ProgramItem>(programQuery);

    const mediaQuery = useMemoFirebase(() => event ? query(
        collection(firestore, 'events', event.id, 'media'),
        orderBy('uploadTimestamp', 'desc'),
        limit(12)
    ) : null, [event, firestore]);
    const { data: media } = useCollection<Media>(mediaQuery);

    const nowHappening = useMemo(() => program?.find(p => p.status === 'In Progress'), [program]);
    const nextHappening = useMemo(() => program?.find(p => p.status === 'Upcoming'), [program]);

    const pollsQuery = useMemoFirebase(() => event ? query(collection(firestore, 'events', event.id, 'polls')) : null, [event, firestore]);
    const { data: polls } = useCollection<Poll>(pollsQuery);

    const autographsQuery = useMemoFirebase(() => event ? query(collection(firestore, 'events', event.id, 'autographs'), orderBy('createdAt', 'desc'), limit(20)) : null, [event, firestore]);
    const { data: autographs } = useCollection<Autograph>(autographsQuery);

    const handleAutograph = async () => {
        if (!event || !guest || !autographMsg) return;
        setIsSubmitting(true);
        try {
            await addDoc(collection(firestore, 'events', event.id, 'autographs'), {
                guestName: guest.name,
                message: autographMsg,
                createdAt: serverTimestamp(),
            });
            toast({ title: "Message Left!", description: "Thank you for your kind words." });
            setAutographMsg('');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingEvent) return <div className="flex h-screen items-center justify-center bg-secondary"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    if (!event) return <div className="flex min-screen items-center justify-center text-muted-foreground p-4">Event not found.</div>;

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="relative h-64 w-full text-white flex items-end p-6 overflow-hidden">
                <Image src={`https://picsum.photos/seed/${event.id}/1200/800`} alt="Event" fill className="object-cover brightness-50" />
                <div className="relative z-10 space-y-2 text-center w-full">
                    <div className="flex justify-center mb-2">
                        <Badge className={cn(isEnded ? "bg-muted text-muted-foreground" : "bg-accent text-accent-foreground")}>
                            {isEnded ? "Concluded" : event.eventType}
                        </Badge>
                    </div>
                    <h1 className="text-3xl font-headline font-bold">{event.name}</h1>
                    <p className="text-sm flex items-center justify-center gap-2"><MapPin className="h-4 w-4" />{event.location}</p>
                </div>
            </div>

            {/* Post-Event Celebration Banner */}
            {isEnded && (
                <div className="bg-primary/10 border-b p-6 text-center space-y-2">
                    <History className="h-8 w-8 mx-auto text-primary opacity-50 mb-2" />
                    <h2 className="text-2xl font-headline font-bold text-primary">Memories of {event.name}</h2>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">The celebration has ended, but the moments live on. Browse the gallery and messages from our wonderful guests.</p>
                </div>
            )}

            {/* Identification Bar */}
            {!isEnded && (
                <div className="bg-muted/50 border-b p-4 sticky top-0 z-40 backdrop-blur-md">
                    {guest ? (
                        <div className="container flex items-center justify-between mx-auto">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center"><UserCheck className="h-5 w-5 text-primary" /></div>
                                <div><p className="font-bold text-sm">Welcome, {guest.name}</p><p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{guest.category}</p></div>
                            </div>
                            {guest.hasCheckedIn && <Badge className="bg-green-600">Checked-In</Badge>}
                        </div>
                    ) : (
                        <div className="container flex flex-col md:flex-row items-center gap-4 mx-auto">
                            <p className="text-sm font-semibold text-center">Identify yourself to unlock interactive features.</p>
                            <div className="flex w-full md:w-auto gap-2">
                                <Input placeholder="Guest Code" className="h-9 w-32 uppercase" value={lookupCode} onChange={e => setLookupCode(e.target.value)} />
                                <Button size="sm" onClick={handleIdentify} disabled={isIdentifying}>Identify</Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Live Program Pulse */}
            {!isEnded && (
                <div className="container mx-auto px-4 mt-6">
                    <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-none shadow-sm overflow-hidden">
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                            <div className="flex-1 border-r border-border/50 pr-4">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                    <CirclePlay className="h-3 w-3 text-primary animate-pulse" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Now Happening</span>
                                </div>
                                <p className="font-bold text-sm line-clamp-1 text-center md:text-left">{nowHappening?.title || "Intermission"}</p>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                    <ArrowRightCircle className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Up Next</span>
                                </div>
                                <p className="font-semibold text-sm line-clamp-1 opacity-70 text-center md:text-left">{nextHappening?.title || "TBD"}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Main Content Area */}
            <div className="container mx-auto px-4 mt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full h-12 bg-muted/50 p-1 rounded-xl">
                        <TabsTrigger value="program" className="flex-1 rounded-lg text-xs font-bold">{isEnded ? "Timeline" : "Program"}</TabsTrigger>
                        <TabsTrigger value="interact" className="flex-1 rounded-lg text-xs font-bold">{isEnded ? "Messages" : "Interact"}</TabsTrigger>
                        <TabsTrigger value="media" className="flex-1 rounded-lg text-xs font-bold">Gallery</TabsTrigger>
                        {!isEnded && <TabsTrigger value="gift" className="flex-1 rounded-lg text-xs font-bold">Gifts</TabsTrigger>}
                    </TabsList>

                    <TabsContent value="program" className="mt-6 space-y-6">
                        <div className="max-w-md mx-auto space-y-6">
                            <ProgramPreviewCard event={event} />
                            {!isEnded && <MenuPreviewCard event={event} />}
                        </div>
                    </TabsContent>

                    <TabsContent value="interact" className="mt-6 space-y-6">
                        <div className="max-w-4xl mx-auto space-y-6">
                            {/* Autograph Wall */}
                            <Card className={cn(isEnded ? "border-none shadow-none bg-transparent" : "")}>
                                <CardHeader className={cn(isEnded ? "px-0 text-center" : "text-center")}>
                                    <CardTitle className="flex items-center justify-center gap-2">
                                        <PenSquare className="h-5 w-5 text-primary"/> {isEnded ? "Final Messages" : "Celebration Wall"}
                                    </CardTitle>
                                    {isEnded && <CardDescription>Notes left by guests during the celebration.</CardDescription>}
                                </CardHeader>
                                <CardContent className={cn(isEnded ? "px-0" : "space-y-6")}>
                                    {!isEnded && guest && (
                                        <div className="flex gap-2 mb-6">
                                            <Input placeholder="Leave a celebratory message..." value={autographMsg} onChange={e => setAutographMsg(e.target.value)} />
                                            <Button onClick={handleAutograph} disabled={isSubmitting || !autographMsg}><Send className="h-4 w-4"/></Button>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {autographs?.map(item => (
                                            <div key={item.id} className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-200/50 shadow-sm transition-transform hover:scale-105">
                                                <p className="text-lg font-['Caveat',_cursive] text-yellow-900 dark:text-yellow-200 text-center md:text-left">&quot;{item.message}&quot;</p>
                                                <p className="text-right text-[10px] font-bold uppercase tracking-widest text-yellow-700/60 mt-2">— {item.guestName}</p>
                                            </div>
                                        ))}
                                        {!autographs?.length && <p className="col-span-full text-center text-xs text-muted-foreground py-12 italic">No messages were left on the wall.</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {!isEnded && polls?.length ? (
                                <Card>
                                    <CardHeader className="text-center"><CardTitle className="flex items-center justify-center gap-2"><Vote className="h-5 w-5 text-primary"/> Live Polls</CardTitle></CardHeader>
                                    <CardContent className="space-y-6">
                                        {polls.map(poll => (
                                            <div key={poll.id} className="space-y-3">
                                                <p className="font-bold text-sm text-center md:text-left">{poll.question}</p>
                                                {poll.options.map((opt, i) => (
                                                    <div key={i} className="space-y-1">
                                                        <div className="flex justify-between text-xs font-medium"><span>{opt.text}</span><span>{Math.round((opt.votes / (poll.totalVotes || 1)) * 100)}%</span></div>
                                                        <Progress value={(opt.votes / (poll.totalVotes || 1)) * 100} className="h-1.5" />
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            ) : null}
                        </div>
                    </TabsContent>

                    <TabsContent value="media" className="mt-6">
                        <div className="max-w-4xl mx-auto space-y-6">
                            {!isEnded && (
                                <Card className="border-dashed"><CardContent className="pt-6"><ImageUploader eventId={event.id} /></CardContent></Card>
                            )}
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {media?.map(item => (
                                    <div key={item.id} className="aspect-square relative rounded-xl overflow-hidden border shadow-sm group">
                                        <Image src={item.fileUrl} alt="Memory" fill className="object-cover transition-transform group-hover:scale-110 duration-500" />
                                    </div>
                                ))}
                                {!media?.length && (
                                    <div className="col-span-full text-center text-muted-foreground py-20 border-2 border-dashed rounded-3xl">
                                        <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                        <p>No photos have been shared yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {!isEnded && (
                        <TabsContent value="gift" className="mt-6">
                            <div className="max-w-md mx-auto text-center space-y-6 py-12">
                                <div className="mx-auto bg-accent/10 p-6 rounded-full w-fit"><Gift className="h-12 w-12 text-accent" /></div>
                                <h2 className="text-2xl font-headline font-bold text-center">The Gift Registry</h2>
                                <p className="text-muted-foreground text-center">Select an item from the registry to contribute to the celebration.</p>
                                <Button className="w-full h-12 rounded-full font-bold" asChild><Link href={`/guest-dashboard/gift-registry`}>Browse Registry</Link></Button>
                            </div>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </div>
    );
}