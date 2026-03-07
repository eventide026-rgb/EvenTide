
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleCheck, Shield } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

type SecurityAssignment = {
    id: string;
    eventId: string;
    eventName: string;
    eventDate: any;
};

export default function SecurityEventSelectionPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const assignmentsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'events'), where(`cohostIds.${user.uid}`, '==', true));
    }, [user, firestore]);

    const { data: assignedEvents, isLoading } = useCollection<SecurityAssignment>(assignmentsQuery);

    if (isLoading || isUserLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            <Card>
                <CardHeader className="text-center items-center">
                    <Shield className="h-12 w-12 text-primary" />
                    <CardTitle className="text-3xl font-headline pt-2">Security Assignments</CardTitle>
                    <CardDescription>Select the event you are currently working at to activate the scanner.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {assignedEvents && assignedEvents.length > 0 ? (
                        assignedEvents.map(event => (
                            <Card key={event.id} className="p-4 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">{event.eventName}</h3>
                                    <p className="text-sm text-muted-foreground">{event.eventDate?.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                <Button asChild>
                                    <Link href={`/security-dashboard/${event.id}/activate`}>
                                        <CircleCheck className="mr-2 h-4 w-4" />
                                        Select Event
                                    </Link>
                                </Button>
                            </Card>
                        ))
                    ) : (
                         <p className="text-center text-muted-foreground py-8">You have no event assignments.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
