
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const profileFormSchema = z.object({
  promoterName: z.string().min(2, { message: 'Promoter name must be at least 2 characters.' }),
  bio: z.string().max(300, { message: 'Bio cannot exceed 300 characters.' }).optional(),
});

export default function ProfilePage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const ticketierRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'ticketiers', user.uid);
  }, [firestore, user]);

  const { data: ticketierProfile, isLoading: isLoadingProfile } = useDoc(ticketierRef);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      promoterName: '',
      bio: '',
    },
  });

  useEffect(() => {
    if (ticketierProfile) {
      form.reset({
        promoterName: ticketierProfile.promoterName,
        bio: ticketierProfile.bio || '',
      });
    }
  }, [ticketierProfile, form]);

  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    if (!ticketierRef) return;
    setIsLoading(true);
    try {
      await updateDoc(ticketierRef, {
        ...values,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: 'Profile Updated',
        description: 'Your public promoter profile has been saved.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not save your profile. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoadingProfile) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>My Public Profile</CardTitle>
                <CardDescription>Manage your public-facing promoter profile.</CardDescription>
            </CardHeader>
            <CardContent>
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Public Profile</CardTitle>
        <CardDescription>Manage your public-facing promoter profile. This information will be visible on your page at /t/{user?.uid}.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Tell your audience about what you do..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
