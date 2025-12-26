
'use client';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GatepassPreviewCard } from '@/components/stationery/previews/gatepass-preview';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function GatepassPreviewPage({ params }: { params: { eventId: string } }) {
    const firestore = useFirestore();
    const eventRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'events', params.eventId);
    }, [firestore, params.eventId]);

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
             <Button variant="outline" asChild className="mb-4">
                <Link href={`/owner-dashboard/stationery-hub/invitation-studio/${params.eventId}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Invitation Studio
                </Link>
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>Gate Pass Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <GatepassPreviewCard event={event} />
                </CardContent>
            </Card>
        </div>
    );
}
