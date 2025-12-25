
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
import { setDoc, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { VendorSpecialties } from "@/lib/placeholder-images";


const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required." }),
  lastName: z.string().min(2, { message: "Last name is required." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  role: z.enum(["Owner", "Planner", "Hotelier", "Hall Owner", "Car Hire Service", "Ticketier", "Vendor", "Fashion Designer", "Security"], { required_error: "You need to select a role." }),
  promoterName: z.string().optional(),
  vendorSpecialty: z.string().optional(),
}).refine(data => {
    if (data.role === 'Ticketier') {
        return !!data.promoterName && data.promoterName.length >= 2;
    }
    return true;
}, {
    message: "Promoter name is required for Ticketiers.",
    path: ["promoterName"],
}).refine(data => {
    if (data.role === 'Vendor') {
        return !!data.vendorSpecialty;
    }
    return true;
}, {
    message: "Please select a vendor specialty.",
    path: ["vendorSpecialty"],
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
      promoterName: "",
    },
  });

  const role = form.watch("role");

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
            const batch = writeBatch(firestore);

            const userProfileData: any = {
                id: user.uid,
                email: values.email,
                role: values.role,
                firstName: values.firstName,
                lastName: values.lastName,
                createdAt: serverTimestamp(),
            };
            
            if (values.role === 'Vendor' || values.role === 'Fashion Designer') {
                userProfileData.specialty = values.role === 'Fashion Designer' ? 'Fashion Designer' : values.vendorSpecialty;
            }
            
            const userDocRef = doc(firestore, "users", user.uid);
            batch.set(userDocRef, userProfileData);

            if (values.role === 'Ticketier') {
                const ticketierProfileData = {
                    id: user.uid,
                    promoterName: values.promoterName,
                    bio: `The official promoter page for ${values.promoterName}.`,
                    avatarUrl: `https://picsum.photos/seed/${user.uid}/200`,
                    createdAt: serverTimestamp(),
                };
                const ticketierDocRef = doc(firestore, "ticketiers", user.uid);
                batch.set(ticketierDocRef, ticketierProfileData);
            }
            
            if (values.role === 'Vendor' || values.role === 'Fashion Designer') {
                const vendorData = {
                    id: user.uid,
                    name: `${values.firstName} ${values.lastName}`,
                    email: values.email,
                    specialty: userProfileData.specialty,
                    createdAt: serverTimestamp(),
                };
                const vendorDocRef = doc(firestore, 'vendors', user.uid);
                batch.set(vendorDocRef, vendorData);
            }

            await batch.commit().catch((error) => {
                 const contextualError = new FirestorePermissionError({
                    path: 'batch write',
                    operation: 'create',
                    requestResourceData: { userProfileData },
                });
                errorEmitter.emit('permission-error', contextualError);
            });

            sessionStorage.setItem('isNewLogin', 'true');

            toast({
                title: "Account Created!",
                description: "Welcome to EvenTide! Redirecting you now...",
            });
            
            const roleDashboardMap: Record<string, string> = {
                "Owner": "/owner-dashboard",
                "Planner": "/planner-dashboard",
                "Hotelier": "/hotelier-dashboard",
                "Hall Owner": "/hall-owner-dashboard",
                "Car Hire Service": "/car-hire-dashboard",
                "Ticketier": "/ticketier-dashboard",
                "Vendor": "/vendor-dashboard",
                "Fashion Designer": "/vendor-dashboard",
                "Security": "/security-dashboard",
            };
            router.push(roleDashboardMap[values.role] || "/owner-dashboard");

        }

    } catch (error: any) {
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
                  <SelectItem value="Vendor">Vendor (Photographer, Caterer, etc.)</SelectItem>
                  <SelectItem value="Fashion Designer">Fashion Designer</SelectItem>
                  <SelectItem value="Hotelier">Hotelier</SelectItem>
                  <SelectItem value="Hall Owner">Venue / Hall Owner</SelectItem>
                  <SelectItem value="Car Hire Service">Car Hire Service</SelectItem>
                  <SelectItem value="Ticketier">Ticketier / Promoter</SelectItem>
                  <SelectItem value="Security">Security Personnel</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {role === "Ticketier" && (
            <FormField
                control={form.control}
                name="promoterName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Promoter Name</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Vibes on Vibes Ent." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        )}
        {role === "Vendor" && (
            <FormField
                control={form.control}
                name="vendorSpecialty"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Vendor Specialty</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select your specialty" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {VendorSpecialties.map(specialty => (
                                    <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
        )}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : 'Create Account'}
        </Button>
      </form>
    </Form>
  );
}
