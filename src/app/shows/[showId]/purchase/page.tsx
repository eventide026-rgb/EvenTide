
'use client';

import { use, Suspense, useState, useMemo } from 'react';
import { notFound, useSearchParams, useRouter } from 'next/navigation';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
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
import { Loader2, Lock, CreditCard } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { usePaystackPayment } from 'react-paystack';

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
  const ticketSelection = useMemo((): { tierId: string; quantity: number }[] => {
    if (!selectionParam) return [];
    const pairs = selectionParam.split(',');
    return pairs.map(p => {
        const [tierId, quantity] = p.split(':');
        return { tierId, quantity: parseInt(quantity, 10) };
    });
  }, [selectionParam]);

  const tierIds = useMemo(() => ticketSelection.map(s => s.tierId), [ticketSelection]);

  const tiersQuery = useMemoFirebase(() => {
    if (!firestore || !showId || tierIds.length === 0) return null;
    return query(collection(firestore, 'shows', showId, 'ticketTiers'), where(documentId(), 'in', tierIds));
  }, [firestore, showId, tierIds]);

  const { data: tiers, isLoading: isLoadingTiers } = useCollection<TicketTier>(tiersQuery);

  const populatedSelection = useMemo((): TicketSelection[] => {
    if (!tiers) return [];
    return ticketSelection.map(sel => {
        const tier = tiers.find(t => t.id === sel.tierId);
        const price = tier?.price || 0;
        return { 
            tierId: sel.tierId,
            quantity: sel.quantity,
            tierName: tier?.name || 'Unknown Tier', 
            price, 
            total: sel.quantity * price 
        };
    });
  }, [ticketSelection, tiers]);

  const grandTotal = useMemo(() => {
    return populatedSelection.reduce((sum, item) => sum + item.total, 0);
  }, [populatedSelection]);

  const totalTickets = useMemo(() => {
    return populatedSelection.reduce((sum, item) => sum + item.quantity, 0);
  }, [populatedSelection]);

  const finalizePurchase = async (paystackReference: string) => {
    if (!firestore || !user || populatedSelection.length === 0) return;

    const batch = writeBatch(firestore);
    const purchaseId = uuidv4();

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
                paymentReference: paystackReference,
            });
        }
    });
    
    try {
      await batch.commit();
      
      // Dispatch multi-channel notification
      if (user.email) {
          fetch('/api/notify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  email: user.email,
                  subject: `Tickets Secured: Confirmation for Show ID ${showId.substring(0, 6)}`,
                  message: `Congratulations! Your purchase was successful. You have secured ${totalTickets} ticket(s). You can view your digital tickets and entry passes in your profile dashboard or on the confirmation page.`
              }),
          }).catch(err => console.error("Post-purchase notification failed:", err));
      }

      toast({ title: 'Purchase Successful!', description: 'Your tickets have been generated.' });
      router.push(`/shows/${showId}/confirmation/${purchaseId}`);
    } catch (error) {
        console.error("Purchase error:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Payment confirmed but failed to generate tickets. Please contact support.' });
        setIsProcessing(false);
    }
  };

  const config = {
    reference: (new Date()).getTime().toString(),
    email: user?.email || '',
    amount: grandTotal * 100, // Paystack works in kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
  };

  // @ts-ignore - Compatibility shim for React 19 peer deps issue handled by package.json overrides
  const initializePayment = usePaystackPayment(config);

  const handleStartPayment = () => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Login Required', description: 'Please log in to purchase tickets.' });
        router.push(`/login?redirect=/shows/${showId}/purchase?selection=${selectionParam}`);
        return;
    }

    if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
        toast({ 
            variant: 'destructive', 
            title: 'Payment Not Configured', 
            description: 'The payment gateway is not configured on this server. Contact administrator.' 
        });
        return;
    }

    setIsProcessing(true);
    // @ts-ignore - Compatibility shim
    initializePayment({
        onSuccess: (reference: any) => {
            finalizePurchase(reference.reference);
        },
        onClose: () => {
            setIsProcessing(false);
            toast({ title: 'Payment Cancelled' });
        }
    });
  };

  const isLoading = isUserLoading || isLoadingTiers;

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (!selectionParam || populatedSelection.length === 0) {
    return notFound();
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Checkout</CardTitle>
        <CardDescription>Review your ticket selection and proceed to secure payment via Paystack.</CardDescription>
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
             <Button className="w-full" size="lg" disabled={isProcessing} onClick={handleStartPayment}>
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                {isProcessing ? 'Waiting for Paystack...' : `Pay ₦${grandTotal.toLocaleString()}`}
            </Button>
            <p className="text-[10px] text-center text-muted-foreground mt-4 flex items-center justify-center gap-1">
                <Lock className="h-2 w-2" /> Secured by Paystack
            </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PurchasePage({ params }: { params: Promise<{ showId: string }> }) {
  const resolvedParams = use(params);
  return (
    <div className="container mx-auto px-4 py-12">
      <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <PurchasePageContents showId={resolvedParams.showId} />
      </Suspense>
    </div>
  );
}
