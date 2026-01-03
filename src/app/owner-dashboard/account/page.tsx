
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, doc, serverTimestamp, writeBatch, getDocs } from 'firebase/firestore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, Crown, Info, UserCheck, ShieldCheck, Users } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Event = {
  id: string;
  name: string;
  ownerId: string;
};

type PricePlan = {
  id: string;
  name: string;
  price: number;
  description?: string;
  maxGuests: number;
  plannerLimit: number;
  cohostLimit: number;
  securityPersonnelLimit: number;
  features?: string[];
  isPopular?: boolean;
};

const seedPricePlansData: Omit<PricePlan, 'id'>[] = [
    {
        name: "Free",
        price: 0,
        description: "For small, intimate gatherings and personal events.",
        maxGuests: 20,
        plannerLimit: 0,
        cohostLimit: 2,
        securityPersonnelLimit: 0,
        features: ["Digital Invitations", "QR Code Gate Passes"],
        isPopular: false,
    },
    {
        name: "Standard",
        price: 45000,
        description: "Ideal for weddings, birthdays, and corporate events.",
        maxGuests: 150,
        plannerLimit: 1,
        cohostLimit: 4,
        securityPersonnelLimit: 2,
        features: ["Guest Management", "Team Collaboration"],
        isPopular: false,
    },
    {
        name: "Gold",
        price: 80000,
        description: "For larger events and professional planners.",
        maxGuests: 300,
        plannerLimit: 1,
        cohostLimit: 8,
        securityPersonnelLimit: 4,
        features: ["Advanced Analytics", "Budget Tracking"],
        isPopular: true,
    },
    {
        name: "Platinum",
        price: 120000,
        description: "The ultimate package for grand occasions.",
        maxGuests: 500,
        plannerLimit: 1,
        cohostLimit: 16,
        securityPersonnelLimit: 8,
        features: ["Priority Support", "AI-Powered Tools"],
        isPopular: false,
    },
    {
        name: "Festival",
        price: 200000,
        description: "Engineered for large-scale public events.",
        maxGuests: 1000,
        plannerLimit: 1,
        cohostLimit: 99, // Essentially unlimited
        securityPersonnelLimit: 16,
        features: ["Public Ticket Sales", "Vendor Marketplace"],
        isPopular: false,
    },
];

export default function AccountPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);

  // 1. Fetch the owner's events
  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, "events"), where('ownerId', '==', user.uid));
  }, [firestore, user?.uid]);
  const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

  // 2. Fetch all available pricing plans
  const plansQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "price_plans"));
  }, [firestore]);
  const { data: pricePlans, isLoading: isLoadingPlans } = useCollection<PricePlan>(plansQuery);
  
  // Seed database if plans are missing
  useEffect(() => {
    const seedDatabase = async () => {
      if (firestore && !isLoadingPlans && pricePlans?.length === 0) {
        console.log("No pricing plans found. Seeding database...");
        const batch = writeBatch(firestore);
        const plansCollection = collection(firestore, "price_plans");
        seedPricePlansData.forEach(plan => {
          const docRef = doc(plansCollection);
          batch.set(docRef, plan);
        });
        await batch.commit();
        console.log("Database seeded successfully.");
        // We don't need to force a refresh, useCollection will pick up the new data.
      }
    };
    seedDatabase();
  }, [firestore, pricePlans, isLoadingPlans]);


  const sortedPricePlans = useMemo(() => {
    if (!pricePlans) return [];
    return [...pricePlans].sort((a, b) => a.price - b.price);
  }, [pricePlans]);

  // 3. Handle purchase simulation
  const handlePurchase = async (planId: string) => {
    if (!firestore || !selectedEventId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select an event first.',
      });
      return;
    }
    setIsPurchasing(planId);

    const eventPricingData = {
      pricePlanId: planId,
      eventId: selectedEventId,
      purchasedAt: serverTimestamp(),
    };

    try {
      const eventPricingCol = collection(firestore, "events", selectedEventId, 'event_pricing');
      await addDoc(eventPricingCol, eventPricingData);
      
      const planName = pricePlans?.find(p => p.id === planId)?.name || 'Plan';
      toast({
        title: 'Purchase Successful!',
        description: `The ${planName} has been applied to your event.`,
      });
    } catch (error) {
      console.error('Error purchasing plan:', error);
      toast({
        variant: 'destructive',
        title: 'Purchase Failed',
        description: 'Could not apply the plan to your event. Please try again.',
      });
    } finally {
      setIsPurchasing(null);
    }
  };

  const isLoading = isUserLoading || isLoadingEvents;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Account & Billing</CardTitle>
          <CardDescription>
            Upgrade your event by purchasing a plan. Purchases are applied per event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md space-y-2">
            <Label htmlFor="event-select">Step 1: Select an Event</Label>
            {isLoadingEvents ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Select onValueChange={setSelectedEventId} value={selectedEventId || ''}>
                <SelectTrigger id="event-select">
                  <SelectValue placeholder="Select an event to upgrade..." />
                </SelectTrigger>
                <SelectContent>
                  {events && events.length > 0 ? (
                    events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-events" disabled>
                      You have no events.
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>
      
      {!selectedEventId && (
          <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Select an Event</AlertTitle>
              <AlertDescription>
                  Please choose an event from the dropdown above to view available plans.
              </AlertDescription>
          </Alert>
      )}

      {selectedEventId && (
        <div>
            <h2 className="text-2xl font-bold font-headline mb-4">Step 2: Choose Your Plan</h2>
            {isLoadingPlans ? (
                 <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 items-start">
                     {[...Array(4)].map((_, i) => <Card key={i} className="min-h-[300px] flex justify-center items-center"><Loader2 key={i} className='h-8 w-8 animate-spin' /></Card>)}
                 </div>
            ) : (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5 items-start">
                    {sortedPricePlans.map((plan) => (
                        <Card key={plan.id} className={cn(
                        "flex flex-col transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl relative", 
                        plan.isPopular && "border-2 border-primary shadow-lg shadow-primary/20"
                        )}>
                        {plan.isPopular && <Badge className="absolute -top-3 right-4">Popular</Badge>}
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
                            <div className="flex items-baseline gap-1">
                            <p className="text-4xl font-bold">₦{plan.price.toLocaleString()}</p>
                            </div>
                            <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-3">
                            <li className="flex items-start gap-2 text-sm">
                                <Users className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                                <span>Up to <span className='font-bold'>{plan.maxGuests.toLocaleString()}</span> Guests</span>
                            </li>
                             <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                <UserCheck className="h-4 w-4 text-green-500 flex-shrink-0 mt-1" />
                                <span><span className='font-bold'>{plan.plannerLimit}</span> Planner(s)</span>
                            </li>
                             <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                <UserCheck className="h-4 w-4 text-green-500 flex-shrink-0 mt-1" />
                                <span><span className='font-bold'>{plan.cohostLimit}</span> Co-host(s)</span>
                            </li>
                             <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                <ShieldCheck className="h-4 w-4 text-green-500 flex-shrink-0 mt-1" />
                                <span><span className='font-bold'>{plan.securityPersonnelLimit}</span> Security</span>
                            </li>
                            {plan.features?.map((feature, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-1" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => handlePurchase(plan.id)} disabled={isPurchasing !== null}>
                                {isPurchasing === plan.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isPurchasing === plan.id ? "Purchasing..." : "Purchase for Event"}
                            </Button>
                        </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
      )}
    </div>
  );
}
