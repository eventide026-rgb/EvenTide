'use client';

import { use, Suspense } from 'react';
import { notFound } from 'next/navigation';
import { useFirestore, useUser, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Ticket, CheckCircle, Download } from 'lucide-react';
import Link from 'next/link';

type Show = {
    id: string;
    name: string;
}

type TicketData = {
    id: string;
    tierName: string;
    ticketCode: string;
}

function ConfirmationPageContents({ showId, purchaseId }: { showId: string, purchaseId: string }) {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();

    const showRef = useMemoFirebase(() => doc(firestore, 'shows', showId), [firestore, showId]);
    const { data: show, isLoading: isLoadingShow } = useDoc<Show>(showRef);

    const ticketsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(
            collection(firestore, 'shows', showId, 'tickets'),
            where('purchaseId', '==', purchaseId),
            where('buyerId', '==', user.uid)
        );
    }, [firestore, showId, purchaseId, user]);
    
    const { data: tickets, isLoading: isLoadingTickets } = useCollection<TicketData>(ticketsQuery);

    const isLoading = isUserLoading || isLoadingShow || isLoadingTickets;

    if (isLoading) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    
    if (!tickets || tickets.length === 0) {
        return notFound();
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader className="items-center text-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <CardTitle className="text-3xl mt-4">Purchase Confirmed!</CardTitle>
                <CardDescription>Thank you for your purchase. Your tickets for {show?.name} are below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2 rounded-lg border p-4">
                    {tickets.map(ticket => (
                        <div key={ticket.id} className="flex justify-between items-center bg-muted/50 p-3 rounded-md">
                            <div>
                                <p className="font-semibold">{ticket.tierName}</p>
                                <p className="text-sm text-muted-foreground font-mono">{ticket.ticketCode}</p>
                            </div>
                            <Button variant="ghost" size="icon"><Download className="h-5 w-5" /></Button>
                        </div>
                    ))}
                </div>
                 <Button asChild className="w-full">
                    <Link href="/shows">Find More Shows</Link>
                </Button>
            </CardContent>
        </Card>
    )
}

export default function ConfirmationPage({ params }: { params: Promise<{ showId: string, purchaseId: string }> }) {
    const { showId, purchaseId } = use(params);
    return (
        <div className="container mx-auto px-4 py-12">
            <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
                <ConfirmationPageContents showId={showId} purchaseId={purchaseId} />
            </Suspense>
        </div>
    );
}
