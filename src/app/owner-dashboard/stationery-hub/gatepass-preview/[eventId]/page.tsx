
'use client';

import { use } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GatepassPreviewCard } from '@/components/stationery/previews/gatepass-preview';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function GatepassPreviewPage({ params }: { params: Promise<{ eventId: string }> }) {
    const { eventId } = use(params);
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
                    <Link href={`/owner-dashboard/stationery-hub/invitation-studio/${eventId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Invitation Studio
                    </Link>
                </Button>
                 <Button asChild>
                    <Link href={`/owner-dashboard/stationery-hub/program-preview/${eventId}`}>
                        Next: Program Preview
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
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
