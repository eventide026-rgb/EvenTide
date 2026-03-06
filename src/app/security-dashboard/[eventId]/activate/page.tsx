
'use client';

import { useState, use } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { KeyRound, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

const formSchema = z.object({
  securityCode: z.string().min(4, { message: 'Code must be at least 4 characters.' }),
});

type Event = {
  securityCode?: string;
}

export default function ActivateScannerPage({ params }: { params: Promise<{ eventId: string }> }) {
    const { eventId } = use(params);
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const firestore = useFirestore();

    const eventRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'events', eventId);
    }, [firestore, eventId]);

    const { data: eventData } = useDoc<Event>(eventRef);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            securityCode: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        const enteredCode = values.securityCode.trim().toUpperCase();
        const correctCode = eventData?.securityCode;

        if (correctCode && enteredCode === correctCode) {
            toast({
                title: 'Code Accepted',
                description: 'Activating scanner...',
            });
            // Store a token in session storage to prove activation
            sessionStorage.setItem(`scanner_activated_${eventId}`, 'true');
            router.push(`/security-dashboard/${eventId}/scanner`);
        } else {
            toast({
                variant: 'destructive',
                title: 'Invalid Code',
                description: 'The security code is incorrect. Please check with the event manager.',
            });
            form.reset();
            setIsLoading(false);
        }
    }

    return (
        <Card className="mx-auto max-w-sm w-full">
            <CardHeader className="items-center text-center">
                <KeyRound className="h-10 w-10 text-primary" />
                <CardTitle className="text-2xl font-headline pt-2">On-Site Verification</CardTitle>
                <CardDescription>
                    Enter the temporary security code provided by the event manager to begin check-in.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="securityCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Event Security Code</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="Enter code..." 
                                            {...field}
                                            onChange={e => field.onChange(e.target.value.toUpperCase())}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLoading ? 'Verifying...' : 'Activate Scanner'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
