
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { type Vendor } from '@/lib/types';

type Event = {
  id: string;
  name: string;
  ownerId: string;
};

const proposalSchema = z.object({
    eventId: z.string({ required_error: 'Please select an event.' }),
    description: z.string().min(10, 'Please provide a detailed description of the designs.'),
    budget: z.coerce.number().min(1, 'Please propose a budget for the commission.'),
    terms: z.string().optional(),
});

type FashionProposalDialogProps = {
  designer: Vendor;
};

export function FashionProposalDialog({ designer }: FashionProposalDialogProps) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm<z.infer<typeof proposalSchema>>({
        resolver: zodResolver(proposalSchema),
        defaultValues: {
            description: "",
            budget: 0,
            terms: ""
        }
    });

    const eventsQuery = useMemoFirebase(() => {
        if (!firestore || !user?.uid) return null;
        return query(collection(firestore, 'events'), where('ownerId', '==', user.uid));
    }, [firestore, user?.uid]);
    
    const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

    const onSubmit = async (values: z.infer<typeof proposalSchema>) => {
        if(!user || !firestore) return;

        const contractData = {
            ...values,
            ownerId: user.uid,
            designerId: designer.id,
            status: 'pending',
            createdAt: serverTimestamp(),
        }

        const batch = writeBatch(firestore);

        // 1. Create the contract document
        const contractRef = doc(collection(firestore, 'events', values.eventId, 'fashionContracts'));
        batch.set(contractRef, contractData);

        // 2. Create notification for the designer
        const notificationRef = doc(collection(firestore, 'users', designer.id, 'notifications'));
        batch.set(notificationRef, {
            message: `You have a new commission request from an event owner.`,
            link: `/vendor-dashboard/my-commissions`,
            read: false,
            createdAt: serverTimestamp(),
            userId: designer.id
        });

        try {
            await batch.commit();
            toast({
                title: 'Proposal Sent!',
                description: `Your commission request has been sent to ${designer.name}.`,
            });
            form.reset();
            setIsOpen(false);
        } catch (error) {
            console.error('Error sending proposal:', error);
            toast({
                variant: 'destructive',
                title: 'Failed to send proposal',
                description: 'There was an issue sending your request. Please try again.',
            });
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="w-full">Commission Designer</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                 <DialogHeader>
                    <DialogTitle>Commission {designer.name}</DialogTitle>
                    <DialogDescription>
                        Send a formal proposal for your event designs.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="eventId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Select Event</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingEvents}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={isLoadingEvents ? "Loading events..." : "Which event is this for?"} />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        {events?.map(event => (
                                            <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
                                        ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Designs Needed</FormLabel>
                                    <FormControl>
                                        <Textarea rows={4} placeholder="e.g., One traditional Agbada for the groom, two matching Aso-Ebi outfits for the mothers..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="budget"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Proposed Budget (₦)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="250000" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="terms"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Additional Terms (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea rows={2} placeholder="e.g., First fitting required by Nov 15th." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Proposal
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
