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
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useFirestore } from "@/firebase";
import { addDoc, collection } from "firebase/firestore";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";

const formSchema = z.object({
  name: z.string().min(2, { message: "Please enter your name or business name." }),
  email: z.string().email({ message: "Please enter a valid contact email." }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters." }),
  concept: z.string().min(20, { message: "Concept must be at least 20 characters." }),
});

export function AdRequestForm() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const firestore = useFirestore();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            subject: "",
            concept: "",
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

        const adRequestData = {
            ...values,
            status: 'pending',
            createdAt: new Date(),
        };

        const adRequestsCol = collection(firestore, "events");

        addDoc(adRequestsCol, adRequestData)
            .then((docRef) => {
                console.log("Ad request submitted with ID: ", docRef.id);
                toast({
                    title: "Proposal Submitted!",
                    description: "Thank you for your interest. Our team will review your proposal and be in touch shortly.",
                });
                form.reset();
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
                 const contextualError = new FirestorePermissionError({
                    path: adRequestsCol.path,
                    operation: 'create',
                    requestResourceData: adRequestData,
                });
                errorEmitter.emit('permission-error', contextualError);
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: "There was a problem with your submission. Please try again.",
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
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
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contact Email</FormLabel>
                            <FormControl>
                                <Input placeholder="name@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Campaign Subject</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Sponsorship of Tech Conference" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="concept"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Advertisement Concept</FormLabel>
                            <FormControl>
                                <Textarea
                                    rows={5}
                                    placeholder="Describe your advertising idea, target audience, and desired placement..."
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Submitting..." : "Submit Request"}
                </Button>
            </form>
        </Form>
    );
}
