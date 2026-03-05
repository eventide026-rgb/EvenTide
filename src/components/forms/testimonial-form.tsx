"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useFirestore } from "@/firebase";
import { addDoc, collection } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

const formSchema = z.object({
  name: z.string().min(2, { message: "Please enter your name or business name." }),
  role: z.enum(["Event Owner / Host", "Planner", "Guest"], {
    required_error: "You need to select your role.",
  }),
  testimonial: z.string().min(20, { message: "Testimonial must be at least 20 characters." }),
});

export function TestimonialForm() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const firestore = useFirestore();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            testimonial: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!firestore) {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "Could not connect to the database. Please try again.",
            });
            return;
        }
        setIsLoading(true);

        const testimonialData = {
            ...values,
            isApproved: false,
            createdAt: new Date(),
        };

        const testimonialsCol = collection(firestore, "testimonials");

        try {
            await addDoc(testimonialsCol, testimonialData);
            toast({
                title: "Submission Received!",
                description: "Thank you for your feedback. Your testimonial is awaiting review.",
            });
            form.reset();
        } catch (error) {
            console.error("Error adding document: ", error);
             const contextualError = new FirestorePermissionError({
                path: testimonialsCol.path,
                operation: 'create',
                requestResourceData: testimonialData,
            });
            errorEmitter.emit('permission-error', contextualError);
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with your submission. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Your Name / Business Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., John Doe or JD Events" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Your Role</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your role on the platform" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Event Owner / Host">Event Owner / Host</SelectItem>
                                    <SelectItem value="Planner">Planner</SelectItem>
                                    <SelectItem value="Guest">Guest</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="testimonial"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Your Testimonial</FormLabel>
                            <FormControl>
                                <Textarea
                                    rows={5}
                                    placeholder="Tell us what you loved about EvenTide..."
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Submitting..." : "Submit for Review"}
                </Button>
            </form>
        </Form>
    );
}