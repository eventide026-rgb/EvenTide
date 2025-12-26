
'use client';

import { useState, useEffect } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, documentId } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Image as ImageIcon, Palette, Ticket, BookOpen, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type Event = {
  id: string;
  name: string;
  ownerId: string;
  primaryColor?: string;
  secondaryColor?: string;
  imageUrls?: string[];
};

type StudioCardProps = {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  disabled?: boolean;
};

const StudioCard = ({ title, description, href, icon: Icon, disabled }: StudioCardProps) => {
    const cardContent = (
        <Card className={cn("group transition-all duration-300 hover:shadow-lg", disabled ? "bg-muted/50" : "hover:border-primary")}>
            <CardHeader className="flex-row items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                    <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <div className={cn("flex items-center text-sm font-semibold", disabled ? "text-muted-foreground" : "text-primary group-hover:text-primary/80")}>
                    <span>{disabled ? "Select an event to enable" : "Go to Studio"}</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
            </CardContent>
        </Card>
    );

    if (disabled) {
        return <div className="cursor-not-allowed">{cardContent}</div>;
    }

    return <Link href={href}>{cardContent}</Link>
};

export default function StationeryHubPage() {
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();

    // Fetch planner's event assignments
    const assignmentsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'planners'), where('plannerId', '==', user.uid));
    }, [firestore, user]);

    const { data: assignments, isLoading: isLoadingAssignments } = useCollection<{eventId: string}>(assignmentsQuery);

    const eventIds = useMemo(() => assignments?.map(a => a.eventId) || [], [assignments]);

    // Fetch the actual event documents based on the assignments
    const eventsQuery = useMemoFirebase(() => {
        if (!firestore || eventIds.length === 0) return null;
        return query(collection(firestore, 'events'), where(documentId(), 'in', eventIds));
    }, [firestore, eventIds]);

    const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

    const selectedEvent = events?.find(e => e.id === selectedEventId) || null;

    const isLoading = isUserLoading || isLoadingAssignments || isLoadingEvents;
    
    const studioLinks = [
        { title: "Invitation Studio", description: "Set master theme, background, and fonts.", href: `/owner-dashboard/stationery-hub/invitation-studio/${selectedEventId}`, icon: Palette },
        { title: "Gatepass Preview", description: "See how the scannable gate pass will look.", href: `/owner-dashboard/stationery-hub/gatepass-preview/${selectedEventId}`, icon: Ticket },
        { title: "Program Designer", description: "View the event's schedule on a themed card.", href: `/owner-dashboard/stationery-hub/program-preview/${selectedEventId}`, icon: BookOpen },
        { title: "AI Thank-You Notes", description: "Generate personalized thank-you notes.", href: `/owner-dashboard/stationery-hub/thank-you-notes/${selectedEventId}`, icon: Send },
    ];

    return (
        <div className="space-y-8">
             <header>
                <h1 className="text-3xl font-bold font-headline">Stationery Hub</h1>
                <p className="text-muted-foreground">Your central place for event branding and design.</p>
            </header>
            
            <Card>
                <CardHeader>
                    <CardTitle>Step 1: Select Your Event</CardTitle>
                    <CardDescription>Choose the event you want to design for. This will load its master theme.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Loading your events...</span>
                        </div>
                    ) : (
                        <Select onValueChange={setSelectedEventId} value={selectedEventId || ''}>
                            <SelectTrigger className="w-full md:w-1/2 lg:w-1/3">
                                <SelectValue placeholder="Select an event..." />
                            </SelectTrigger>
                            <SelectContent>
                                {events && events.length > 0 ? (
                                    events.map((event) => (
                                        <SelectItem key={event.id} value={event.id}>
                                            {event.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-events" disabled>You have no active events.</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    )}
                </CardContent>
            </Card>

            {selectedEvent && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Step 2: Review Master Theme</CardTitle>
                        <CardDescription>This is the current visual identity for &quot;{selectedEvent.name}&quot;.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <h4 className="font-semibold mb-2">Master Background</h4>
                             <div className="aspect-video relative rounded-lg overflow-hidden border">
                                {selectedEvent.imageUrls && selectedEvent.imageUrls.length > 0 ? (
                                    <Image src={selectedEvent.imageUrls[0]} alt="Event background" fill className="object-cover" />
                                ) : (
                                    <div className="bg-muted h-full flex items-center justify-center">
                                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="md:col-span-2">
                             <h4 className="font-semibold mb-2">Color Palette</h4>
                             <div className="flex gap-4">
                                <div className="flex-1">
                                    <div className="w-full h-16 rounded-md border" style={{ backgroundColor: selectedEvent.primaryColor || '#cccccc' }}></div>
                                    <p className="text-sm font-medium mt-1">Primary Color</p>
                                    <p className="text-xs text-muted-foreground">{selectedEvent.primaryColor}</p>
                                </div>
                                <div className="flex-1">
                                    <div className="w-full h-16 rounded-md border" style={{ backgroundColor: selectedEvent.secondaryColor || '#cccccc' }}></div>
                                    <p className="text-sm font-medium mt-1">Accent Color</p>
                                    <p className="text-xs text-muted-foreground">{selectedEvent.secondaryColor}</p>
                                </div>
                             </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Step 3: Choose Your Studio</CardTitle>
                    <CardDescription>Select a tool to design or preview your event materials.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    {studioLinks.map(link => (
                        <StudioCard 
                            key={link.title}
                            {...link}
                            disabled={!selectedEvent}
                        />
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
