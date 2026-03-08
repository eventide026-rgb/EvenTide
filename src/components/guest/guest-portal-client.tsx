
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, limit, doc, serverTimestamp, addDoc, updateDoc, increment, arrayUnion, orderBy, onSnapshot } from 'firebase/firestore';
import { Loader2, Music, Image as ImageIcon, Calendar, Gift, Vote, PenSquare, UserCheck, MapPin, Sparkles, Send, Clock, CirclePlay, ArrowRightCircle, Megaphone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Image from 'next/image';
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

    const [songTitle, setSongTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [autographMsg, setAutographMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Live Announcements Listener
    useEffect(() => {
        if (!event?.id || !firestore) return;

        const announcementsRef = collection(firestore, 'events', event.id, 'announcements');
        const q = query(announcementsRef, orderBy('timestamp', 'desc'), limit(1));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    const data = change.doc.data() as Announcement;
                    // Only show toast for very recent announcements
                    const isRecent = data.timestamp?.toMillis && (Date.now() - data.timestamp.toMillis() < 30000);
                    if (isRecent) {
                        toast({
                            title: "EVENT ANNOUNCEMENT",
                            description: data.content,
                            duration: 10000,
                        });
                    }
                }
            });
        });

        return () => unsubscribe();
    }, [event?.id, firestore, toast]);

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

    const nowHappening = useMemo(() => program?.find(p => p.status === 'In Progress'), [program]);
    const nextHappening = useMemo(() => program?.find(p => p.status === 'Upcoming'), [program]);

    const pollsQuery = useMemoFirebase(() => event ? query(collection(firestore, 'events', event.id, 'polls')) : null, [event, firestore]);
    const { data: polls } = useCollection<Poll>(pollsQuery);

    const autographsQuery = useMemoFirebase(() => event ? query(collection(firestore, 'events', event.id, 'autographs'), orderBy('createdAt', 'desc'), limit(10)) : null, [event, firestore]);
    const { data: autographs } = useCollection<Autograph>(autographsQuery);

    const announcementsQuery = useMemoFirebase(() => event ? query(collection(firestore, 'events', event.id, 'announcements'), orderBy('timestamp', 'desc'), limit(5)) : null, [event, firestore]);
    const { data: announcements } = useCollection<Announcement>(announcementsQuery);

    const handleSongRequest = async () => {
        if (!event || !guest || !songTitle) return;
        setIsSubmitting(true);
        try {
            await addDoc(collection(firestore, 'events', event.id, 'songRequests'), {
                songTitle,
                artist,
                requesterName: guest.name,
                status: 'pending',
                createdAt: serverTimestamp(),
            });
            toast({ title: "Song Requested!", description: "The DJ has received your request." });
            setSongTitle('');
            setArtist('');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVote = async (poll: Poll, optionText: string) => {
        if (!event || !user || poll.voters?.includes(user.uid)) return;
        const pollRef = doc(firestore, 'events', event.id, 'polls', poll.id);
        const updatedOptions = poll.options.map(opt => 
            opt.text === optionText ? { ...opt, votes: (opt.votes || 0) + 1 } : opt
        );
        await updateDoc(pollRef, {
            options: updatedOptions,
            totalVotes: increment(1),
            voters: arrayUnion(user.uid)
        });
        toast({ title: "Vote Cast!" });
    };

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
                <div className="relative z-10 space-y-2">
                    <Badge className="bg-accent text-accent-foreground">{event.eventType}</Badge>
                    <h1 className="text-3xl font-headline font-bold">{event.name}</h1>
                    <p className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4" />{event.location}</p>
                </div>
            </div>

            {/* Identification Bar */}
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

            {/* Live Program Pulse */}
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

            {/* Main Tabs */}
            <div className="container mx-auto px-4 mt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full h-12 bg-muted/50 p-1 rounded-xl">
                        <TabsTrigger value="program" className="flex-1 rounded-lg text-xs font-bold">Program</TabsTrigger>
                        <TabsTrigger value="interact" className="flex-1 rounded-lg text-xs font-bold">Interact</TabsTrigger>
                        <TabsTrigger value="media" className="flex-1 rounded-lg text-xs font-bold">Gallery</TabsTrigger>
                        <TabsTrigger value="gift" className="flex-1 rounded-lg text-xs font-bold">Gifts</TabsTrigger>
                    </TabsList>

                    <TabsContent value="program" className="mt-6 space-y-6">
                        <div className="max-w-md mx-auto space-y-6">
                            <ProgramPreviewCard event={event} />
                            <MenuPreviewCard event={event} />
                        </div>
                    </TabsContent>

                    <TabsContent value="interact" className="mt-6 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                            {/* Announcements Feed */}
                            <Card className="md:col-span-2 bg-primary/5 border-primary/20">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-primary">
                                        <Megaphone className="h-5 w-5" /> Live Broadcasts
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {announcements?.map(ann => (
                                            <div key={ann.id} className="bg-background/80 p-3 rounded-xl border shadow-sm">
                                                <p className="text-sm font-medium">{ann.content}</p>
                                                <p className="text-[10px] text-muted-foreground mt-1 font-bold uppercase">{ann.timestamp ? format(ann.timestamp.toDate(), 'p') : ''}</p>
                                            </div>
                                        ))}
                                        {!announcements?.length && <p className="text-center text-xs text-muted-foreground py-4 italic">Waiting for event updates...</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Polls */}
                            <Card>
                                <CardHeader><CardTitle className="flex items-center justify-center md:justify-start gap-2"><Vote className="h-5 w-5 text-primary"/> Live Polls</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                    {polls?.map(poll => {
                                        const hasVoted = poll.voters?.includes(user?.uid || '');
                                        return (
                                            <div key={poll.id} className="space-y-3">
                                                <p className="font-bold text-sm text-center md:text-left">{poll.question}</p>
                                                {hasVoted ? (
                                                    poll.options.map((opt, i) => (
                                                        <div key={i} className="space-y-1">
                                                            <div className="flex justify-between text-xs font-medium"><span>{opt.text}</span><span>{Math.round((opt.votes / (poll.totalVotes || 1)) * 100)}%</span></div>
                                                            <Progress value={(opt.votes / (poll.totalVotes || 1)) * 100} className="h-1.5" />
                                                        </div>
                                                    ))
                                                ) : (
                                                    <RadioGroup onValueChange={val => handleVote(poll, val)} className="grid gap-2">
                                                        {poll.options.map((opt, i) => (
                                                            <div key={i} className="flex items-center space-x-2 border p-2 rounded-lg hover:bg-muted transition-colors">
                                                                <RadioGroupItem value={opt.text} id={`${poll.id}-${i}`} />
                                                                <Label htmlFor={`${poll.id}-${i}`} className="flex-1 cursor-pointer">{opt.text}</Label>
                                                            </div>
                                                        ))}
                                                    </RadioGroup>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {!polls?.length && <p className="text-center text-sm text-muted-foreground py-4">No active polls at the moment.</p>}
                                </CardContent>
                            </Card>

                            {/* Song Requests */}
                            <Card>
                                <CardHeader><CardTitle className="flex items-center justify-center md:justify-start gap-2"><Music className="h-5 w-5 text-primary"/> Request a Song</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    {guest ? (
                                        <>
                                            <Input placeholder="Song Name" value={songTitle} onChange={e => setSongTitle(e.target.value)} />
                                            <Input placeholder="Artist (Optional)" value={artist} onChange={e => setArtist(e.target.value)} />
                                            <Button className="w-full" onClick={handleSongRequest} disabled={isSubmitting || !songTitle}>Send Request</Button>
                                        </>
                                    ) : (
                                        <p className="text-center text-sm text-muted-foreground py-4">Identify yourself to request songs.</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Autograph Wall */}
                            <Card className="md:col-span-2">
                                <CardHeader><CardTitle className="flex items-center justify-center md:justify-start gap-2"><PenSquare className="h-5 w-5 text-primary"/> Celebration Wall</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex gap-2">
                                        <Input placeholder="Leave a celebratory message..." value={autographMsg} onChange={e => setAutographMsg(e.target.value)} />
                                        <Button onClick={handleAutograph} disabled={isSubmitting || !autographMsg || !guest}><Send className="h-4 w-4"/></Button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {autographs?.map(item => (
                                            <div key={item.id} className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-200/50 shadow-sm rotate-1">
                                                <p className="text-lg font-['Caveat',_cursive] text-yellow-900 dark:text-yellow-200 text-center md:text-left">&quot;{item.message}&quot;</p>
                                                <p className="text-right text-[10px] font-bold uppercase tracking-widest text-yellow-700/60 mt-2">— {item.guestName}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="media" className="mt-6">
                        <div className="max-w-4xl mx-auto space-y-6">
                            <Card className="border-dashed"><CardContent className="pt-6"><ImageUploader eventId={event.id} /></CardContent></Card>
                            <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-3xl">
                                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                <p>Live Photo Stream is active. Be the first to share a moment!</p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="gift" className="mt-6">
                        <div className="max-w-md mx-auto text-center space-y-6 py-12">
                            <div className="mx-auto bg-accent/10 p-6 rounded-full w-fit"><Gift className="h-12 w-12 text-accent" /></div>
                            <h2 className="text-2xl font-headline font-bold text-center">The Gift Registry</h2>
                            <p className="text-muted-foreground text-center">Select an item from the registry to contribute to the celebration.</p>
                            <Button className="w-full h-12 rounded-full font-bold" asChild><Link href={`/guest-dashboard/gift-registry`}>Browse Registry</Link></Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
