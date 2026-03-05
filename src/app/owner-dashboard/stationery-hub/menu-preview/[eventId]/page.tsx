'use client';

import { use, Suspense } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MenuPreviewCard } from '@/components/stationery/previews/menu-preview';

function MenuPreviewPageContent({ eventId }: { eventId: string }) {
    const firestore = useFirestore();

    const eventRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'events', eventId);
    }, [firestore, eventId]);

    const { data: event, isLoading } = useDoc(eventRef);

    if (isLoading || !event) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
             <div className="flex justify-between items-center mb-4">
                 <Button variant="outline" asChild>
                    <Link href={`/owner-dashboard/stationery-hub/program-preview/${eventId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Program
                    </Link>
                </Button>
                <Button asChild>
                    <Link href={`/owner-dashboard/stationery-hub/thank-you-notes/${eventId}`}>
                        Next: Thank-You Notes
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Menu Card Preview</CardTitle>
                    <CardDescription>This is a read-only preview of how your event menu will appear to guests.</CardDescription>
                </CardHeader>
                <CardContent>
                   <MenuPreviewCard event={event} />
                </CardContent>
            </Card>
        </div>
    );
}

export default function MenuPreviewPage({ params }: { params: Promise<{ eventId: string }> }) {
    const { eventId } = use(params);

    return (
        <Suspense fallback={<div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin"/></div>}>
            <MenuPreviewPageContent eventId={eventId} />
        </Suspense>
    );
}
