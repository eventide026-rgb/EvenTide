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

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Please enter your name." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters long." }),
  message: z.string().min(20, { message: "Message must be at least 20 characters long." }),
});

export function ContactForm() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const firestore = useFirestore();

    const form = useForm<z.infer<typeof contactFormSchema>>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            name: "",
            email: "",
            subject: "",
            message: "",
        },
    });

    async function onSubmit(values: z.infer<typeof contactFormSchema>) {
        if (!firestore) {
            toast({
                variant: "destructive",
                title: "Database connection failed",
                description: "Could not connect to the database. Please try again.",
            });
            return;
        }
        setIsLoading(true);

        const ticketData = {
            ...values,
            status: 'open',
            priority: 'medium',
            createdAt: new Date(),
        };

        const supportTicketsCol = collection(firestore, "supportTickets");

        try {
            const docRef = await addDoc(supportTicketsCol, ticketData);
            console.log("Support ticket created with ID: ", docRef.id);
            toast({
                title: "Message Sent!",
                description: "Thank you for reaching out. Our team will get back to you shortly.",
            });
            form.reset();
        } catch (error) {
            console.error("Error creating support ticket: ", error);
             const contextualError = new FirestorePermissionError({
                path: supportTicketsCol.path,
                operation: 'create',
                requestResourceData: ticketData,
            });
            errorEmitter.emit('permission-error', contextualError);
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: "There was a problem sending your message. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                     <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Your Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} />
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
                                <FormLabel>Your Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="name@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Question about pricing" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>How can we help?</FormLabel>
                            <FormControl>
                                <Textarea
                                    rows={6}
                                    placeholder="Please provide as much detail as possible..."
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Message"}
                </Button>
            </form>
        </Form>
    );
}
