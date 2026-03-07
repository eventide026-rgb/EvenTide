'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, ChefHat, Loader2, Info } from 'lucide-react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, documentId } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Event = {
    id: string;
    name: string;
};

type EventPlannerAssignment = {
    id: string;
    eventId: string;
};

export default function ProgramMenuHubPage() {
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const assignmentsQuery = useMemoFirebase(() => {
        if (!firestore || !user?.uid) return null;
        return query(collection(firestore, 'planners'), where('plannerId', '==', user.uid));
    }, [firestore, user?.uid]);
    const { data: assignments, isLoading: isLoadingAssignments } = useCollection<EventPlannerAssignment>(assignmentsQuery);
    
    const eventIds = useMemo(() => assignments?.map(a => a.eventId) || [], [assignments]);
    
    const eventsQuery = useMemoFirebase(() => {
        if (!firestore || eventIds.length === 0) return null;
        return query(collection(firestore, 'events'), where(documentId(), 'in', eventIds));
    }, [firestore, eventIds]);
    const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

    const isLoading = isUserLoading || isLoadingEvents || isLoadingAssignments;
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
                        {disabled ? 'Select an event first' : `Open ${title}`}
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">Program & Menu</h1>
                <p className="text-muted-foreground">Orchestrate the event's schedule and culinary experience.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Step 1: Select an Event</CardTitle>
                    <CardDescription>Choose an event to manage its program and menu.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Label>Select Event</Label>
                    {isLoading ? (
                        <div className="flex items-center gap-2 text-muted-foreground mt-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Loading your events...</span>
                        </div>
                    ) : (
                        <Select onValueChange={setSelectedEventId} value={selectedEventId || ''}>
                            <SelectTrigger className="w-full md:w-1/2 mt-2">
                                <SelectValue placeholder="Select an event to manage" />
                            </SelectTrigger>
                            <SelectContent>
                                {events && events.length > 0 ? (
                                    events.map((event) => (
                                        <SelectItem key={event.id} value={event.id}>
                                            {event.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-events" disabled>You have no assigned events.</SelectItem>
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
                       The planners are disabled until you select an event from the dropdown above.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid md:grid-cols-2 gap-8">
                <CardLink
                    href="/planner-dashboard/program-menu/program-planner"
                    title="Program Planner"
                    description="Build the event's schedule, add notes for the MC, and get AI-powered drafts."
                    icon={FileText}
                    disabled={!isEventSelected}
                />
                <CardLink
                    href="/planner-dashboard/program-menu/menu-planner"
                    title="Menu Planner"
                    description="Design the menu course by course, detail each dish, and get AI-generated ideas."
                    icon={ChefHat}
                    disabled={!isEventSelected}
                />
            </div>
        </div>
    );
}
