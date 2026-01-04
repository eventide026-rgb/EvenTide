
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, ChefHat, Loader2, Info } from 'lucide-react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Event = {
    id: string;
    name: string;
};

export default function ProgramMenuHubPage() {
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const eventsQuery = useMemoFirebase(() => {
        if (!firestore || !user?.uid) return null;
        return query(collection(firestore, 'events'), where('ownerId', '==', user.uid));
    }, [firestore, user?.uid]);
    
    const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

    const isLoading = isUserLoading || isLoadingEvents;
    const isEventSelected = !!selectedEventId;

    const CardLink = ({ href, title, description, icon: Icon, disabled }: { href: string, title: string, description: string, icon: React.ElementType, disabled: boolean }) => (
        <Card className={cn("flex flex-col transition-opacity", disabled && "opacity-50")}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Icon /> {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-end">
                <Button asChild disabled={disabled}>
                    <Link href={disabled ? '#' : `${href}?eventId=${selectedEventId}`}>
                        {disabled ? 'Select an event first' : `View ${title}`}
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">Program & Menu Oversight</h1>
                <p className="text-muted-foreground">Monitor the schedule and menu crafted by your planner.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Step 1: Select an Event</CardTitle>
                    <CardDescription>Choose an event to view its program and menu details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Label>Select Event</Label>
                    {isLoading ? (
                        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /><span>Loading your events...</span></div>
                    ) : (
                        <Select onValueChange={setSelectedEventId} value={selectedEventId || ''}>
                            <SelectTrigger className="w-full md:w-1/2">
                                <SelectValue placeholder="Select an event to view details" />
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

            {!isEventSelected && (
                 <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Choose an Event to Continue</AlertTitle>
                    <AlertDescription>
                       The viewers are disabled until you select an event from the dropdown above.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid md:grid-cols-2 gap-8">
                <CardLink
                    href="/owner-dashboard/program-menu/program-planner"
                    title="Program Viewer"
                    description="Get a read-only overview of the event's to-do list and progress."
                    icon={FileText}
                    disabled={!isEventSelected}
                />
                <CardLink
                    href="/owner-dashboard/program-menu/menu-planner"
                    title="Menu Viewer"
                    description="View a read-only preview of the menu designed for the event."
                    icon={ChefHat}
                    disabled={!isEventSelected}
                />
            </div>
        </div>
    );
}
