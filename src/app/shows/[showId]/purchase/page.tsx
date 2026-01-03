'use client';

import { use, Suspense, useState, useMemo } from 'react';
import { notFound, useSearchParams, useRouter } from 'next/navigation';
import { useFirestore, useUser, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import {
  doc,
  collection,
  query,
  where,
  documentId,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, Ticket } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

type TicketTier = {
  id: string;
  name: string;
  price: number;
};

type TicketSelection = {
  tierId: string;
  tierName: string;
  quantity: number;
  price: number;
  total: number;
};

function PurchasePageContents({ showId }: { showId: string }) {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const selectionParam = searchParams.get('selection');
  const ticketSelection = useMemo((): TicketSelection[] => {
    if (!selectionParam) return [];
    const pairs = selectionParam.split(',');
    return pairs.map(p => {
        const [tierId, quantity] = p.split(':');
        return { tierId, quantity: parseInt(quantity, 10), tierName: '', price: 0, total: 0 };
    });
  }, [selectionParam]);

  const tierIds = useMemo(() => ticketSelection.map(s => s.tierId), [ticketSelection]);

  const tiersQuery = useMemoFirebase(() => {
    if (!firestore || !showId || tierIds.length === 0) return null;
    return query(collection(firestore, 'shows', showId, 'ticketTiers'), where(documentId(), 'in', tierIds));
  }, [firestore, showId, tierIds]);

  const { data: tiers, isLoading: isLoadingTiers } = useCollection<TicketTier>(tiersQuery);

  const populatedSelection = useMemo(() => {
    if (!tiers) return ticketSelection;
    return ticketSelection.map(sel => {
        const tier = tiers.find(t => t.id === sel.tierId);
        const price = tier?.price || 0;
        return { ...sel, tierName: tier?.name || 'Unknown Tier', price, total: sel.quantity * price };
    });
  }, [ticketSelection, tiers]);

  const grandTotal = useMemo(() => {
    return populatedSelection.reduce((sum, item) => sum + item.total, 0);
  }, [populatedSelection]);

  const handleConfirmPurchase = async () => {
      if (!firestore || !user || populatedSelection.length === 0) {
          toast({ variant: 'destructive', title: 'Error', description: 'Could not complete purchase.'});
          return;
      }
      setIsProcessing(true);

      const batch = writeBatch(firestore);
      const purchaseId = uuidv4(); // A unique ID for this entire purchase transaction

      populatedSelection.forEach(item => {
          for (let i = 0; i < item.quantity; i++) {
              const ticketRef = doc(collection(firestore, 'shows', showId, 'tickets'));
              batch.set(ticketRef, {
                  showId,
                  buyerId: user.uid,
                  ticketCode: `TKT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
                  tierName: item.tierName,
                  price: item.price,
                  purchasedAt: serverTimestamp(),
                  purchaseId: purchaseId, 
              });
          }
      });
      
      try {
        await batch.commit();
        toast({ title: 'Purchase Successful!', description: 'Redirecting to your tickets...' });
        router.push(`/shows/${showId}/confirmation/${purchaseId}`);
      } catch (error) {
          console.error("Purchase error:", error);
          toast({ variant: 'destructive', title: 'Purchase Failed', description: 'There was an issue creating your tickets.' });
          setIsProcessing(false);
      }
  };

  const isLoading = isUserLoading || isLoadingTiers;

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (!selectionParam) {
    return notFound();
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Confirm Your Purchase</CardTitle>
        <CardDescription>Review your ticket selection before finalizing your payment.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {populatedSelection.map(item => (
            <div key={item.tierId} className="flex justify-between items-center">
                <div>
                    <p className="font-semibold">{item.tierName}</p>
                    <p className="text-sm text-muted-foreground">{item.quantity} x ₦{item.price.toLocaleString()}</p>
                </div>
                <p className="font-semibold">₦{item.total.toLocaleString()}</p>
            </div>
        ))}
        <Separator />
        <div className="flex justify-between items-center font-bold text-lg">
            <p>Grand Total</p>
            <p>₦{grandTotal.toLocaleString()}</p>
        </div>
        <div className="pt-4">
             <Button className="w-full" size="lg" disabled={isProcessing} onClick={handleConfirmPurchase}>
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                {isProcessing ? 'Processing...' : `Pay ₦${grandTotal.toLocaleString()}`}
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PurchasePage({ params }: { params: { showId: string } }) {
  return (
    <div className="container mx-auto px-4 py-12">
      <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <PurchasePageContents showId={params.showId} />
      </Suspense>
    </div>
  );
}
