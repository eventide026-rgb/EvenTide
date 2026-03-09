
'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { Separator } from '@/components/ui/separator';
import { usePaystackPayment } from 'react-paystack';
import { useToast } from '@/hooks/use-toast';

const plans = {
    starter: { name: 'Free Starter', price: 0, description: 'Boutique entrance for intimate gatherings.' },
    basic: { name: 'Basic Hub', price: 10000, description: 'Professional orchestration for growing events.' },
    standard: { name: 'Standard Flow', price: 25000, description: 'The ecosystem benchmark for flawless planning.' },
    premium: { name: 'Premium Edge', price: 50000, description: 'AI-enhanced legacy building and reporting.' },
    enterprise: { name: 'Enterprise Elite', price: 100000, description: 'Maximum scale for grand galas.' },
};

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);

    const planSlug = searchParams.get('plan') || 'starter';
    const plan = plans[planSlug as keyof typeof plans] || plans.starter;

    // MANDATORY AUTH GATE: If not logged in, redirect to login with this page as return path
    useEffect(() => {
        if (!isUserLoading && !user) {
            const currentUrl = window.location.pathname + window.location.search;
            router.replace(`/login?redirect=${encodeURIComponent(currentUrl)}`);
        }
    }, [user, isUserLoading, router]);

    const config = {
        reference: (new Date()).getTime().toString(),
        email: user?.email || '',
        amount: plan.price * 100, // Paystack amount is in kobo
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder',
    };

    const initializePayment = usePaystackPayment(config);

    const handleComplete = () => {
        if (!user) {
            toast({ title: "Login Required", description: "Please sign in to proceed with your plan selection." });
            const currentUrl = window.location.pathname + window.location.search;
            router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
            return;
        }

        if (plan.price === 0) {
            setIsProcessing(true);
            setTimeout(() => {
                toast({ title: "Plan Activated!", description: "Welcome to EvenTide Starter. Let's create your event!" });
                router.push('/owner');
            }, 1500);
            return;
        }

        setIsProcessing(true);
        // @ts-ignore - Paystack hook type mismatch in some versions
        initializePayment({
            onSuccess: () => {
                toast({ title: "Payment Successful!", description: `Plan ${plan.name} is now active. Redirecting to event creation...` });
                router.push('/owner');
            },
            onClose: () => {
                setIsProcessing(false);
                toast({ title: "Payment Cancelled" });
            }
        });
    };

    if (isUserLoading || !user) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground font-headline font-bold uppercase tracking-widest animate-pulse">Securing Session...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <Card className="max-w-md mx-auto border-none shadow-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                        <CreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-headline">Secure Checkout</CardTitle>
                    <CardDescription>Activate your {plan.name} plan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-bold">{plan.name}</p>
                                <p className="text-xs text-muted-foreground">{plan.description}</p>
                            </div>
                            <p className="font-headline font-bold text-lg">₦{plan.price.toLocaleString()}</p>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                <span>Immediate access to dashboard</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                <span>Secured transaction processing</span>
                            </div>
                        </div>
                    </div>

                    <Button className="w-full h-12 font-bold" size="lg" disabled={isProcessing} onClick={handleComplete}>
                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {plan.price === 0 ? "Activate Starter Plan" : `Pay ₦${plan.price.toLocaleString()}`}
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                        <ShieldCheck className="h-3 w-3" /> Encrypted & Secure
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <div className="flex min-h-screen flex-col bg-secondary">
            <PublicHeader />
            <main className="flex-1 flex items-center justify-center pt-24 pb-12">
                <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
                    <CheckoutContent />
                </Suspense>
            </main>
            <PublicFooter />
        </div>
    );
}
