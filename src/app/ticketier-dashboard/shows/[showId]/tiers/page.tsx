
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useState, use } from 'react';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const ticketTierSchema = z.object({
  name: z.string().min(2, "Tier name is required (e.g., VIP)."),
  price: z.coerce.number().min(0, "Price must be 0 or more."),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
});

const formSchema = z.object({
  ticketTiers: z.array(ticketTierSchema).min(1, "At least one ticket tier is required."),
});

export default function TicketTiersPage({ params }: { params: Promise<{ showId: string }> }) {
    const { showId } = use(params);
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const firestore = useFirestore();
    const { user } = useUser();
    
    const showRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'shows', showId);
    }, [firestore, showId]);

    const { data: show, isLoading: isLoadingShow } = useDoc(showRef);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ticketTiers: [{ name: "General Admission", price: 5000, quantity: 100 }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "ticketTiers",
    });
        
    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!firestore || !user || !show) {
            toast({ variant: "destructive", title: "Error", description: "Could not save ticket tiers. Please try again." });
            return;
        }
        setIsLoading(true);

        const batch = writeBatch(firestore);
        const tiersCollection = collection(firestore, 'shows', showId, 'ticketTiers');

        values.ticketTiers.forEach(tier => {
            const tierRef = doc(tiersCollection); // Create a new doc with a random ID
            batch.set(tierRef, {
                ...tier,
                sold: 0,
                showId: showId
            });
        });

        try {
            await batch.commit();
            toast({
                title: "Ticket Tiers Saved!",
                description: `Your show "${show.name}" is now ready for ticket sales.`,
            });
            router.push(`/ticketier-dashboard/shows`);

        } catch (error) {
            console.error("Error saving ticket tiers:", error);
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: "There was a problem saving your ticket tiers.",
            });
        } finally {
            setIsLoading(false);
        }
    }
    
    if (isLoadingShow) {
        return <div className='flex justify-center items-center h-96'><Loader2 className='h-8 w-8 animate-spin' /></div>
    }

    return (
        <Card className="max-w-4xl mx-auto w-full">
            <CardHeader>
                <CardTitle className="text-3xl font-headline">Manage Ticket Tiers</CardTitle>
                <CardDescription>
                    Define the pricing structure for &quot;{show?.name}&quot;. You can add multiple tiers like VIP, Early Bird, etc.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                         <div className="space-y-4">
                            {fields.map((field, index) => (
                               <div key={field.id} className="grid md:grid-cols-8 gap-4 items-start border p-4 rounded-lg relative">
                                    <FormField
                                        control={form.control}
                                        name={`ticketTiers.${index}.name`}
                                        render={({ field }) => (
                                            <FormItem className="col-span-8 md:col-span-3">
                                                <FormLabel>Tier Name</FormLabel>
                                                <FormControl><Input placeholder="e.g., General Admission" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`ticketTiers.${index}.price`}
                                        render={({ field }) => (
                                            <FormItem className="col-span-4 md:col-span-2">
                                                <FormLabel>Price (₦)</FormLabel>
                                                <FormControl><Input type="number" placeholder="5000" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`ticketTiers.${index}.quantity`}
                                        render={({ field }) => (
                                            <FormItem className="col-span-4 md:col-span-2">
                                                <FormLabel>Quantity</FormLabel>
                                                <FormControl><Input type="number" placeholder="100" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="ghost" size="icon" className="col-span-8 md:col-span-1 md:place-self-end" onClick={() => remove(index)} disabled={fields.length <= 1}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                               </div>
                            ))}
                             <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", price: 0, quantity: 0 })}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Another Tier
                            </Button>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLoading ? "Saving Tiers..." : "Save and Publish Show"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
