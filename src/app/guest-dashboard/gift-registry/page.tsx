
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Gift, Check, Banknote } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Event = {
  id: string;
  name: string;
  ownerId: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
};

type Gift = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  quantity: number;
  claimedCount: number;
  claimedBy: { guestId: string; guestName: string }[];
};

export default function GiftRegistryPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [eventId, setEventId] = useState<string | null>(null);
  const [confirmingClaim, setConfirmingClaim] = useState<Gift | null>(null);

  useEffect(() => {
    setEventId(sessionStorage.getItem('guestEventId'));
  }, []);

  const eventRef = useMemoFirebase(() => {
    if (!firestore || !eventId) return null;
    return doc(firestore, 'events', eventId);
  }, [firestore, eventId]);
  const { data: event, isLoading: isLoadingEvent } = useDoc<Event>(eventRef);

  const giftsQuery = useMemoFirebase(() => {
    if (!firestore || !eventId) return null;
    return query(collection(firestore, 'events', eventId, 'gifts'));
  }, [firestore, eventId]);
  const { data: gifts, isLoading: isLoadingGifts } = useCollection<Gift>(giftsQuery);

  const handleClaimGift = async (gift: Gift) => {
    if (!firestore || !user || !eventId) return;

    const giftRef = doc(firestore, 'events', eventId, 'gifts', gift.id);
    const guestName = sessionStorage.getItem('guestName') || 'An anonymous guest';

    await updateDoc(giftRef, {
        claimedCount: gift.claimedCount + 1,
        claimedBy: arrayUnion({ guestId: user.uid, guestName: guestName })
    });
    toast({ title: 'Gift Claimed!', description: `You have successfully claimed ${gift.name}.` });
    setConfirmingClaim(null);
  };
  
  const handleUnclaimGift = async (gift: Gift) => {
    if (!firestore || !user || !eventId) return;

    const giftRef = doc(firestore, 'events', eventId, 'gifts', gift.id);
    const guestName = sessionStorage.getItem('guestName') || 'An anonymous guest';

    await updateDoc(giftRef, {
        claimedCount: gift.claimedCount - 1,
        claimedBy: arrayRemove({ guestId: user.uid, guestName: guestName })
    });
    toast({ title: 'Claim Removed', description: `You have unclaimed ${gift.name}.` });
  }

  const isLoading = isUserLoading || isLoadingEvent || isLoadingGifts;

  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
          <CardTitle>Gift Registry</CardTitle>
          <CardDescription>View the host's wishlist. Items you claim will be marked to prevent duplicate gifts.</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                 <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : gifts && gifts.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gifts.map(gift => {
                        const isFullyClaimed = gift.claimedCount >= gift.quantity;
                        const hasUserClaimed = gift.claimedBy?.some(g => g.guestId === user?.uid);

                        return (
                            <Card key={gift.id} className="flex flex-col">
                                {gift.imageUrl && (
                                    <div className="aspect-video relative">
                                        <Image src={gift.imageUrl} alt={gift.name} fill className="object-cover rounded-t-lg" />
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle>{gift.name}</CardTitle>
                                    <div className='flex items-center justify-between'>
                                        {gift.price && <Badge variant="secondary">₦{gift.price.toLocaleString()}</Badge>}
                                        <Badge variant={isFullyClaimed ? 'default' : 'outline'}>{gift.claimedCount} / {gift.quantity} claimed</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="text-sm text-muted-foreground">{gift.description}</p>
                                </CardContent>
                                <CardFooter>
                                    {hasUserClaimed ? (
                                        <Button className="w-full" variant="outline" onClick={() => handleUnclaimGift(gift)}>
                                            <Check className="mr-2 h-4 w-4 text-green-500" /> You Claimed This
                                        </Button>
                                    ) : (
                                         <Button className="w-full" disabled={isFullyClaimed} onClick={() => setConfirmingClaim(gift)}>
                                            {isFullyClaimed ? 'Fully Claimed' : 'Claim This Gift'}
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-16 border-dashed border-2 rounded-lg">
                    <p className="text-muted-foreground">The host has not added any gifts to the registry yet.</p>
                </div>
            )}
            
            {event && event.bankName && (
                 <Card className="mt-8 bg-secondary">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Banknote className="h-5 w-5"/> Prefer to Give a Cash Gift?</CardTitle>
                        <CardDescription>You can send monetary gifts directly to the host's bank account.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p><strong>Bank:</strong> {event.bankName}</p>
                        <p><strong>Account Number:</strong> {event.accountNumber}</p>
                        <p><strong>Account Name:</strong> {event.accountName}</p>
                    </CardContent>
                 </Card>
            )}

            <AlertDialog open={!!confirmingClaim} onOpenChange={() => setConfirmingClaim(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to claim this gift?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will mark &quot;{confirmingClaim?.name}&quot; as claimed by you, making it visible to the host and other guests.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => confirmingClaim && handleClaimGift(confirmingClaim)}>Yes, Claim It</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </CardContent>
      </Card>
    </div>
  );
}
