
'use client';

import { useState } from 'react';
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

const formSchema = z.object({
  securityCode: z.string().min(4, { message: 'Code must be at least 4 characters.' }),
});

export default function ActivateScannerPage({ params }: { params: { eventId: string } }) {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            securityCode: '',
        },
    });

    // In a real app, this would query Firestore to validate the code
    const validateCode = async (code: string) => {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network latency
        if (code.toUpperCase() === 'SECURE123') {
            return true;
        }
        return false;
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        const isValid = await validateCode(values.securityCode);

        if (isValid) {
            toast({
                title: 'Code Accepted',
                description: 'Activating scanner...',
            });
            router.push(`/security-dashboard/${params.eventId}/scanner`);
        } else {
            toast({
                variant: 'destructive',
                title: 'Invalid Code',
                description: 'The security code is incorrect. Please check with the event manager.',
            });
            form.reset();
        }
        setIsLoading(false);
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
                                        <Input placeholder="Enter code..." {...field} />
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
