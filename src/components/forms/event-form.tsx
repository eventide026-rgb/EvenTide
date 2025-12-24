'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Loader2, PlusCircle, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Switch } from '../ui/switch';

const formSchema = z.object({
    name: z.string().min(3, "Event name must be at least 3 characters."),
    description: z.string().min(20, "Description must be at least 20 characters."),
    location: z.string().min(5, "Location is required."),
    eventDate: z.date({ required_error: "Please select a date and time." }),
    imageUrls: z.array(z.string().url("Must be a valid URL.")).min(1, "At least one image URL is required."),
    isPublic: z.boolean().default(true),
    isTicketed: z.boolean().default(true),
    eventType: z.string().min(2, "Event type is required."),
});


export function EventForm() {
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
            imageUrls: ["https://picsum.photos/seed/1/1200/800"],
            isPublic: true,
            isTicketed: true,
            eventType: "Concert",
        },
    });

    const { fields: imageUrlFields, append: appendImageUrl, remove: removeImageUrl } = useFieldArray({
        control: form.control,
        name: "imageUrls",
    });
        
    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!firestore || !user) {
            toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to create an event." });
            return;
        }
        setIsLoading(true);

        const eventData = {
            ...values,
            ownerId: user.uid,
            createdAt: serverTimestamp(),
            eventDate: values.eventDate,
        };

        try {
            const eventsCol = collection(firestore, "events");
            const docRef = await addDoc(eventsCol, eventData);
            
            toast({
                title: "Event Created!",
                description: `Basics for ${values.name} have been saved.`,
            });
            // Redirect to the ticket tier creation step for this new event
            router.push(`/ticketier-dashboard/events/${docRef.id}/tiers`);

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
                            <FormControl><Input placeholder="e.g., Summer Vibes Fest" {...field} /></FormControl>
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
                            <FormControl><Textarea rows={4} placeholder="Tell everyone what makes your event special..." {...field} /></FormControl>
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
                                <FormControl><Input placeholder="e.g., Landmark Beach, Lagos" {...field} /></FormControl>
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
                                        {/* Simple time picker - can be improved */}
                                        <div className="p-2 border-t">
                                            <Input type="time" defaultValue={format(field.value || new Date(), 'HH:mm')} onChange={(e) => {
                                                const [hours, minutes] = e.target.value.split(':');
                                                const newDate = new Date(field.value);
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
                
                <div className="space-y-2">
                    <FormLabel>Image URLs</FormLabel>
                    <FormDescription>Add at least one public link to an image for your event.</FormDescription>
                     {imageUrlFields.map((field, index) => (
                        <FormField
                            key={field.id}
                            control={form.control}
                            name={`imageUrls.${index}`}
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center gap-2">
                                        <FormControl><Input placeholder="https://picsum.photos/seed/event/1200/800" {...field} /></FormControl>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeImageUrl(index)} disabled={imageUrlFields.length <= 1}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => appendImageUrl("")}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Image URL
                    </Button>
                </div>

                <div className='grid md:grid-cols-2 gap-6'>
                     <FormField
                        control={form.control}
                        name="isTicketed"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Ticketed Event</FormLabel>
                                    <FormDescription>
                                        Enable this to sell tickets for this event.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="isPublic"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Public Event</FormLabel>
                                    <FormDescription>
                                        Allow this event to be listed publicly.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? "Saving..." : "Save and Add Ticket Tiers"}
                </Button>
            </form>
        </Form>
    );
}
