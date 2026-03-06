'use client';

import { use, Suspense } from 'react';
import { useUser } from '@/firebase';
import { Loader2, PartyPopper } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Fireworks from '@/components/ui/fireworks';

function CompletionPageContent({ eventId }: { eventId: string }) {
    const { user } = useUser();
    
    return (
        <div className="max-w-2xl mx-auto text-center relative">
            <Fireworks />
            <Card>
                <CardHeader className="items-center">
                    <div className="p-4 bg-green-500/20 rounded-full">
                        <PartyPopper className="h-10 w-10 text-green-600" />
                    </div>
                    <CardTitle className="mt-4 text-3xl font-headline">Setup Complete!</CardTitle>
                    <CardDescription>
                        That's it, {user?.displayName || 'User'}! You can now interact with your planner and team to make your event a resounding success.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">You can look around your dashboard to see the exciting possibilities of EvenTide.</p>
                     <Button asChild className="mt-6">
                        <Link href="/owner-dashboard">
                            Go to Dashboard
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

export default function StationeryCompletionPage({ params }: { params: Promise<{ eventId: string }> }) {
    const { eventId } = use(params);

    return (
        <div className="flex h-full items-center justify-center">
            <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin"/>}>
                <CompletionPageContent eventId={eventId} />
            </Suspense>
        </div>
    );
}
