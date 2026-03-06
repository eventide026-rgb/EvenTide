'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, writeBatch, documentId, serverTimestamp } from 'firebase/firestore';
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

type EventPlannerAssignment = {
    id: string;
    eventId: string;
};

type Event = {
  id: string;
  name: string;
};

const proposalSchema = z.object({
    eventId: z.string({ required_error: 'Please select an event.' }),
    serviceDescription: z.string().min(10, 'Please provide a detailed description of the service needed.'),
    proposedPayment: z.coerce.number().min(1, 'Please propose a payment amount.'),
});

type VendorProposalDialogProps = {
  vendor: Vendor;
};

export function VendorProposalDialog({ vendor }: VendorProposalDialogProps) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm<z.infer<typeof proposalSchema>>({
        resolver: zodResolver(proposalSchema),
        defaultValues: {
            serviceDescription: "",
            proposedPayment: 0,
        }
    });

    const plannerAssignmentsQuery = useMemoFirebase(() => {
        if (!firestore || !user?.uid) return null;
        return query(collection(firestore, 'planners', user.uid, 'assignments'), where('status', '==', 'accepted'));
    }, [firestore, user?.uid]);
    const { data: assignments, isLoading: isLoadingAssignments } = useCollection<EventPlannerAssignment>(plannerAssignmentsQuery);
    const eventIds = useMemo(() => assignments?.map(a => a.eventId) || [], [assignments]);

    const eventsQuery = useMemoFirebase(() => {
        if (!firestore || eventIds.length === 0) return null;
        return query(collection(firestore, 'events'), where(documentId(), 'in', eventIds));
    }, [firestore, eventIds]);
    const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

    const onSubmit = async (values: z.infer<typeof proposalSchema>) => {
        if(!user || !firestore) return;

        const contractData = {
            ...values,
            plannerId: user.uid,
            vendorId: vendor.id,
            vendorName: vendor.name,
            status: 'pending',
            createdAt: serverTimestamp(),
        }

        const batch = writeBatch(firestore);
        
        const contractRef = doc(collection(firestore, 'events', values.eventId, 'vendorContracts'));
        batch.set(contractRef, contractData);

        const notificationRef = doc(collection(firestore, 'users', vendor.id, 'notifications'));
        batch.set(notificationRef, {
            message: `You have a new job proposal for an event.`,
            link: `/vendor-dashboard/proposals`,
            read: false,
            createdAt: serverTimestamp(),
            userId: vendor.id
        });

        try {
            await batch.commit();
            toast({
                title: 'Proposal Sent!',
                description: `Your proposal has been sent to ${vendor.name}.`,
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
    
    const isLoading = isLoadingAssignments || isLoadingEvents;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="w-full">Invite to Event</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                 <DialogHeader>
                    <DialogTitle>Invite {vendor.name}</DialogTitle>
                    <DialogDescription>
                        Send a formal proposal for their services at your event.
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
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={isLoading ? "Loading events..." : "Which event is this for?"} />
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
                            name="serviceDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Service Description</FormLabel>
                                    <FormControl>
                                        <Textarea rows={3} placeholder="e.g., Full-day photography coverage..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="proposedPayment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Proposed Payment (₦)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="250000" {...field} />
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
