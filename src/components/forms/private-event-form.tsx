
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const eventTypes = [
    "Wedding",
    "Birthday",
    "Anniversary",
    "Gala / Dinner",
    "Conference / Summit",
    "Reunion",
    "Charity Event",
    "Funeral / Memorial",
    "Retirement",
    "General Event"
];

const formSchema = z.object({
    name: z.string().min(3, "Event name must be at least 3 characters."),
    description: z.string().min(20, "Description must be at least 20 characters."),
    location: z.string().min(5, "Location is required."),
    eventDate: z.date({ required_error: "Please select a date and time." }),
    eventType: z.enum(eventTypes as [string, ...string[]], {
        required_error: "You need to select an event type.",
    }),
    primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color."),
    secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color."),
});


export function PrivateEventForm() {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const firestore = useFirestore();
    const { user } = useUser();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            location: "",
            eventType: "Wedding",
            primaryColor: "#4169E1",
            secondaryColor: "#D4AF37",
        },
    });
        
    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!firestore || !user) {
            toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to create an event." });
            return;
        }
        setIsLoading(true);

        const eventCode = `${values.eventType.substring(0, 2).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        const eventData = {
            ...values,
            ownerId: user.uid,
            eventCode: eventCode,
            createdAt: serverTimestamp(),
            eventDate: values.eventDate,
            imageUrls: [`https://picsum.photos/seed/${eventCode}/1200/800`] // Default image
        };

        try {
            const eventsCol = collection(firestore, "events");
            const docRef = await addDoc(eventsCol, eventData);
            
            toast({
                title: "Event Created!",
                description: `Your event "${values.name}" has been successfully created.`,
            });
            router.push(`/owner-dashboard`);

        } catch (error) {
            console.error("Error creating event:", error);
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: "There was a problem creating your event. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Event Name</FormLabel>
                            <FormControl><Input placeholder="e.g., The Grand Wedding Gala" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl><Textarea rows={4} placeholder="Describe the theme and purpose of your event..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location / Venue</FormLabel>
                                <FormControl><Input placeholder="e.g., The Landmark Centre, VI, Lagos" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="eventDate"
                        render={({ field }) => (
                            <FormItem className='flex flex-col'>
                                <FormLabel>Event Date & Time</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP p")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date < new Date()
                                            }
                                            initialFocus
                                        />
                                        <div className="p-2 border-t">
                                            <Input type="time" defaultValue={format(field.value || new Date(), 'HH:mm')} onChange={(e) => {
                                                const [hours, minutes] = e.target.value.split(':');
                                                const newDate = new Date(field.value || new Date());
                                                newDate.setHours(parseInt(hours), parseInt(minutes));
                                                field.onChange(newDate);
                                            }} />
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                
                 <div className='grid md:grid-cols-3 gap-6'>
                     <FormField
                        control={form.control}
                        name="eventType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Event Type</FormLabel>
                                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an event type" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {eventTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="primaryColor"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Primary Color</FormLabel>
                                <FormControl><Input type="color" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="secondaryColor"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Secondary Color</FormLabel>
                                <FormControl><Input type="color" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? "Creating Event..." : "Create Event"}
                </Button>
            </form>
        </Form>
    );
}
