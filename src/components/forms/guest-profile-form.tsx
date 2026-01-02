
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
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
});

export function GuestProfileForm() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);
  const [guestCode, setGuestCode] = useState<string | null>(null);

  useEffect(() => {
    setEventId(sessionStorage.getItem('guestEventId'));
    setGuestCode(sessionStorage.getItem('guestEventCode'));
  }, []);

  const guestDocRef = useMemoFirebase(() => {
    if (!firestore || !eventId || !guestCode) return null;
    return doc(firestore, 'events', eventId, 'guests', guestCode);
  }, [firestore, eventId, guestCode]);

  const { data: guestProfile, isLoading: isLoadingProfile } = useDoc(guestDocRef);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    if (guestProfile) {
      form.reset({
        name: guestProfile.name,
      });
    }
  }, [guestProfile, form]);

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!guestDocRef) return;
    setIsSaving(true);
    try {
      await updateDoc(guestDocRef, {
        name: values.name,
      });
      sessionStorage.setItem('guestName', values.name);
      toast({
        title: 'Profile Updated',
        description: 'Your name has been updated for this event.',
      });
    } catch (error) {
      console.error('Error updating guest profile:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not save your changes. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isUserLoading || isLoadingProfile) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-1/3" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Tunde Ojo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </form>
    </Form>
  );
}
