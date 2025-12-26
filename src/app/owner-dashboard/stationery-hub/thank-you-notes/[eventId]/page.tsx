
'use client';

import { use, Suspense } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function ThankYouNotesPageContent({ eventId }: { eventId: string }) {
    const firestore = useFirestore();

    const eventRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'events', eventId);
    }, [firestore, eventId]);

    const { data: event, isLoading } = useDoc(eventRef);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
             <Button variant="outline" asChild className="mb-4">
                <Link href={`/owner-dashboard/stationery-hub`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Stationery Hub
                </Link>
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>AI Thank-You Note Generator</CardTitle>
                    <CardDescription>Generate personalized thank-you notes for your guests post-event.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='text-center py-16 border-dashed border-2 rounded-lg'>
                        <p className='text-muted-foreground'>AI Thank-You Note generator will be implemented here.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function ThankYouNotesPage({ params }: { params: Promise<{ eventId: string }> }) {
    const { eventId } = use(params);

    return (
        <Suspense fallback={<div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin"/></div>}>
            <ThankYouNotesPageContent eventId={eventId} />
        </Suspense>
    );
}
