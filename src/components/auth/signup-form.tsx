
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth, useFirestore } from "@/firebase";
import { 
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";


const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required." }),
  lastName: z.string().min(2, { message: "Last name is required." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  role: z.enum(["Owner", "Planner", "Hotelier", "Hall Owner"], { required_error: "You need to select a role." }),
});

export function SignUpForm() {
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if(!auth || !firestore) {
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Firebase is not configured correctly. Please try again later.",
      });
      return;
    }

    setIsLoading(true);

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        const user = userCredential.user;

        if (user) {
            const userProfileData = {
                id: user.uid,
                email: values.email,
                role: values.role,
                firstName: values.firstName,
                lastName: values.lastName,
                createdAt: serverTimestamp(),
            };
            
            const userDocRef = doc(firestore, "users", user.uid);

            await setDoc(userDocRef, userProfileData).catch((error) => {
                 // Throw a more specific error for the catch block below
                 const contextualError = new FirestorePermissionError({
                    path: userDocRef.path,
                    operation: 'create',
                    requestResourceData: userProfileData,
                });
                errorEmitter.emit('permission-error', contextualError);
                // Re-throw to be caught by the outer catch block
                throw new Error("Failed to create user profile. Please contact support.");
            });

            sessionStorage.setItem('isNewLogin', 'true');

            toast({
                title: "Account Created!",
                description: "Welcome to EvenTide! Redirecting you now...",
            });

            // The auth handler in the provider will redirect to the correct dashboard.
            // A fallback redirect in case the handler is slow.
            setTimeout(() => {
                const roleDashboardMap: Record<string, string> = {
                    "Owner": "/dashboard",
                    "Planner": "/dashboard",
                    "Hotelier": "/hotelier-dashboard",
                    "Hall Owner": "/hall-owner-dashboard",
                };
                router.push(roleDashboardMap[values.role] || "/dashboard");
            }, 500);
        }

    } catch (error: any) {
      // Handle Firebase Auth errors (e.g., email-already-in-use)
      let description = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        description = "This email address is already in use. Please log in or use a different email.";
      } else if (error.message.startsWith("Failed to create user profile")) {
        description = error.message;
      }
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: description,
      });
      console.error("Sign up error:", error);
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                    <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                    <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
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
              <FormLabel>I am a...</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Owner">Event Owner</SelectItem>
                  <SelectItem value="Planner">Event Planner</SelectItem>
                  <SelectItem value="Hotelier">Hotelier</SelectItem>
                  <SelectItem value="Hall Owner">Venue / Hall Owner</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : 'Create Account'}
        </Button>
      </form>
    </Form>
  );
}
