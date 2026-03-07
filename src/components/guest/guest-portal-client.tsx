'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, getDocs, limit, doc, serverTimestamp, addDoc, orderBy } from 'firebase/firestore';
import { Loader2, Music, Image as ImageIcon, Calendar, Gift, Vote, PenSquare, UserCheck, Star, MapPin, Sparkles, Send, CircleCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ProgramPreviewCard } from '../stationery/previews/program-preview';
import { MenuPreviewCard } from '../stationery/previews/menu-preview';
import { ImageUploader } from '../image-uploader';

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

export function GuestPortalClient({ eventCode }: { eventCode: string }) {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();
    
    const [event, setEvent] = useState<Event | null>(null);
    const [guest, setGuest] = useState<Guest | null>(null);
    const [isLoadingEvent, setIsLoadingEvent] = useState(true);
    const [activeTab, setActiveTab] = useState('program');
    
    // Identification State
    const [lookupCode, setLookupCode] = useState('');
    const [isIdentifying, setIsIdentifying] = useState(false);

    // Initial Event Lookup
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

    // Check session for existing identification
    useEffect(() => {
        const savedGuestId = sessionStorage.getItem(`guest_id_${eventCode}`);
        if (savedGuestId && event?.id) {
            // Re-identify
            const fetchGuest = async () => {
                const gRef = doc(firestore, 'events', event.id, 'guests', savedGuestId);
                const gSnap = await getDocs(query(collection(firestore, 'events', event.id, 'guests'), where('id', '==', savedGuestId), limit(1)));
                if (!gSnap.empty) {
                    setGuest({ id: gSnap.docs[0].id, ...gSnap.docs[0].data() } as Guest);
                }
            };
            fetchGuest();
        }
    }, [event, eventCode, firestore]);

    const handleIdentify = async () => {
        if (!event || !lookupCode) return;
        setIsIdentifying(true);
        try {
            // Find guest by code or name
            const q = query(
                collection(firestore, 'events', event.id, 'guests'), 
                where('guestCode', '==', lookupCode.trim().toUpperCase()), 
                limit(1)
            );
            const snap = await getDocs(q);
            if (!snap.empty) {
                const gData = { id: snap.docs[0].id, ...snap.docs[0].data() } as Guest;
                setGuest(gData);
                sessionStorage.setItem(`guest_id_${eventCode}`, gData.id);
                toast({ title: `Welcome, ${gData.name}!`, description: "You are now identified." });
            } else {
                toast({ variant: 'destructive', title: "Invalid Code", description: "Could not find a guest matching this code." });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsIdentifying(false);
        }
    };

    if (isLoadingEvent) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-secondary">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4 text-center">
                <h1 className="text-4xl font-headline font-bold text-primary">404</h1>
                <p className="mt-2 text-muted-foreground">Event not found. Please double check your link.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Celebration Header */}
            <div className="relative h-64 w-full text-white flex items-end p-6 overflow-hidden">
                <Image 
                    src={`https://picsum.photos/seed/${event.id}/1200/800`} 
                    alt="Celebration" 
                    fill 
                    className="object-cover brightness-50"
                />
                <div className="relative z-10 space-y-2">
                    <Badge className="bg-accent text-accent-foreground font-bold uppercase tracking-widest">{event.eventType}</Badge>
                    <h1 className="text-3xl font-headline font-bold">{event.name}</h1>
                    <p className="text-sm opacity-90 flex items-center gap-2"><Calendar className="h-4 w-4" />{format(event.eventDate.toDate(), 'PPP p')}</p>
                    <p className="text-sm opacity-90 flex items-center gap-2"><MapPin className="h-4 w-4" />{event.location}</p>
                </div>
            </div>

            {/* Personalized Welcome / Identification Bar */}
            <div className="bg-muted/50 border-b p-4">
                {guest ? (
                    <div className="container flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                                <UserCheck className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">Identified as {guest.name}</p>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{guest.category}</p>
                            </div>
                        </div>
                        {guest.hasCheckedIn && <Badge className="bg-green-600"><CircleCheck className="h-3 w-3 mr-1" /> Checked-In</Badge>}
                    </div>
                ) : (
                    <div className="container flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-1 text-center md:text-left">
                            <p className="text-sm font-semibold">Enter your Guest Code to see your seat & request songs.</p>
                        </div>
                        <div className="flex w-full md:w-auto gap-2">
                            <Input 
                                placeholder="Guest Code" 
                                className="h-9 w-32 uppercase" 
                                value={lookupCode} 
                                onChange={e => setLookupCode(e.target.value)} 
                            />
                            <Button size="sm" onClick={handleIdentify} disabled={isIdentifying}>
                                {isIdentifying ? <Loader2 className="h-4 w-4 animate-spin"/> : "Identify"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Tabbed Content */}
            <div className="container mx-auto px-4 mt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full flex h-12 bg-muted/50 p-1 rounded-xl overflow-x-auto no-scrollbar">
                        <TabsTrigger value="program" className="flex-1 rounded-lg text-xs font-bold">Program</TabsTrigger>
                        <TabsTrigger value="seat" className="flex-1 rounded-lg text-xs font-bold">My Seat</TabsTrigger>
                        <TabsTrigger value="interact" className="flex-1 rounded-lg text-xs font-bold">Interact</TabsTrigger>
                        <TabsTrigger value="media" className="flex-1 rounded-lg text-xs font-bold">Gallery</TabsTrigger>
                        <TabsTrigger value="gift" className="flex-1 rounded-lg text-xs font-bold">Gifts</TabsTrigger>
                    </TabsList>

                    <TabsContent value="program" className="mt-6 space-y-6">
                        <div className="max-w-md mx-auto">
                            <ProgramPreviewCard event={event} />
                            <div className="mt-6">
                                <MenuPreviewCard event={event} />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="seat" className="mt-6">
                        <Card className="max-w-md mx-auto border-none shadow-xl bg-gradient-to-br from-primary/5 to-background">
                            <CardHeader className="text-center">
                                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                                    <Sparkles className="h-8 w-8 text-primary" />
                                </div>
                                <CardTitle>Assigned Placement</CardTitle>
                                <CardDescription>Your location in the celebration hall.</CardDescription>
                            </CardHeader>
                            <CardContent className="text-center pb-10">
                                {guest ? (
                                    <div className="space-y-4">
                                        <div className="flex justify-center gap-8">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Table</p>
                                                <p className="text-4xl font-bold">12</p>
                                            </div>
                                            <div className="w-[1px] bg-border h-12" />
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Seat</p>
                                                <p className="text-4xl font-bold">4</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" className="rounded-full">View Chart</Button>
                                    </div>
                                ) : (
                                    <div className="py-8">
                                        <p className="text-muted-foreground text-sm">Please identify yourself to view your assigned seat.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="interact" className="mt-6 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Song Requests */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Music className="h-5 w-5 text-primary"/> Song Requests</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {guest ? (
                                        <div className="flex gap-2">
                                            <Input placeholder="Song Name & Artist..." />
                                            <Button size="icon"><Send className="h-4 w-4"/></Button>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">Identifying yourself allows you to request songs from the DJ.</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Autograph Wall */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><PenSquare className="h-5 w-5 text-primary"/> Celebration Wall</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-2">
                                        <Input placeholder="Leave a well-wish..." />
                                        <Button size="icon" variant="secondary"><Send className="h-4 w-4"/></Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="media" className="mt-6">
                        <div className="max-w-4xl mx-auto space-y-6">
                            <Card className="border-dashed">
                                <CardContent className="pt-6">
                                    <ImageUploader eventId={event.id} />
                                </CardContent>
                            </Card>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="aspect-square relative rounded-lg overflow-hidden bg-muted">
                                        <Image src={`https://picsum.photos/seed/${i + event.id}/300/300`} fill className="object-cover opacity-80" alt="Gallery" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="gift" className="mt-6">
                        <div className="max-w-md mx-auto text-center space-y-6 py-12">
                            <div className="mx-auto bg-accent/10 p-6 rounded-full w-fit">
                                <Gift className="h-12 w-12 text-accent" />
                            </div>
                            <h2 className="text-2xl font-headline font-bold">The Gift Registry</h2>
                            <p className="text-muted-foreground">Contribute to the celebration by selecting an item from the registry.</p>
                            <Button className="w-full h-12 rounded-full font-bold">View Registry Items</Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
