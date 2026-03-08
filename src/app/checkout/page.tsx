
'use client';

import { Suspense, useState, useMemo } from 'react';
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

    const config = {
        reference: (new Date()).getTime().toString(),
        email: user?.email || '',
        amount: plan.price * 100,
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    };

    // @ts-ignore - Shim for peer dependency issue
    const initializePayment = usePaystackPayment(config);

    const handleComplete = () => {
        if (!user) {
            router.push(`/login?redirect=/checkout?plan=${planSlug}`);
            return;
        }

        if (plan.price === 0) {
            setIsProcessing(true);
            setTimeout(() => {
                toast({ title: "Plan Activated!", description: "Welcome to EvenTide Starter." });
                router.push('/owner/create-event');
            }, 1500);
            return;
        }

        if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
            toast({ variant: 'destructive', title: 'Payment Error', description: 'Payment gateway configuration missing.' });
            return;
        }

        setIsProcessing(true);
        // @ts-ignore - Shim
        initializePayment({
            onSuccess: () => {
                toast({ title: "Payment Successful!", description: `Plan ${plan.name} is now active.` });
                router.push('/owner/create-event');
            },
            onClose: () => setIsProcessing(false)
        });
    };

    if (isUserLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

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
                <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
                    <CheckoutContent />
                </Suspense>
            </main>
            <PublicFooter />
        </div>
    );
}
