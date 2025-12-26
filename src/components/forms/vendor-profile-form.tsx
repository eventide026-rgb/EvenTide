
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
import { useEffect, useState } from 'react';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, Linkedin, Globe, Instagram, Facebook } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { TikTokIcon } from '../icons/tiktok';

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Your name or brand name is required.' }),
  bio: z.string().max(500, { message: 'Bio cannot exceed 500 characters.' }).optional(),
  websiteUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  instagramUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  tiktokUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  facebookUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
});

export function VendorProfileForm() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [isSaving, setIsSaving] = useState(false);

  const vendorDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'vendors', user.uid);
  }, [firestore, user]);

  const { data: vendorProfile, isLoading: isLoadingProfile } = useDoc(vendorDocRef);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      bio: '',
      websiteUrl: '',
      instagramUrl: '',
      tiktokUrl: '',
      facebookUrl: '',
    },
  });

  useEffect(() => {
    if (vendorProfile) {
      form.reset({
        name: vendorProfile.name,
        bio: vendorProfile.bio || '',
        websiteUrl: vendorProfile.websiteUrl || '',
        instagramUrl: vendorProfile.instagramUrl || '',
        tiktokUrl: vendorProfile.tiktokUrl || '',
        facebookUrl: vendorProfile.facebookUrl || '',
      });
    }
  }, [vendorProfile, form]);

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!vendorDocRef) return;
    setIsSaving(true);
    try {
      await setDoc(vendorDocRef, {
        ...values,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      toast({
        title: 'Profile Updated',
        description: 'Your public vendor profile has been saved.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not save your profile. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isUserLoading || isLoadingProfile) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Public Name / Brand Name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                 <FormDescription>This is the name clients will see.</FormDescription>
                <FormMessage />
                </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Professional Bio</FormLabel>
                <FormControl><Textarea rows={5} placeholder="Tell your story. What makes your service unique?" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        <div>
            <h3 className="text-lg font-medium">Social & Web Presence</h3>
            <FormDescription className="mb-4">Link to your portfolios and social media pages.</FormDescription>
            <div className="space-y-4">
                <FormField
                    control={form.control}
                    name="websiteUrl"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center gap-2">
                                <Globe className="h-5 w-5 text-muted-foreground" />
                                <FormControl><Input placeholder="https://your-website.com" {...field} /></FormControl>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="instagramUrl"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center gap-2">
                                <Instagram className="h-5 w-5 text-muted-foreground" />
                                <FormControl><Input placeholder="https://instagram.com/your-profile" {...field} /></FormControl>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="tiktokUrl"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center gap-2">
                                <TikTokIcon className="h-5 w-5 text-muted-foreground" />
                                <FormControl><Input placeholder="https://tiktok.com/@your-profile" {...field} /></FormControl>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="facebookUrl"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center gap-2">
                                <Facebook className="h-5 w-5 text-muted-foreground" />
                                <FormControl><Input placeholder="https://facebook.com/your-page" {...field} /></FormControl>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Profile
        </Button>
      </form>
    </Form>
  );
}
