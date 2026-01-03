
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PenSquare, Send } from 'lucide-react';

type Autograph = {
  id: string;
  guestName: string;
  message: string;
  createdAt: any;
};

const autographFormSchema = z.object({
  message: z.string().min(5, 'Message must be at least 5 characters.').max(280, 'Message cannot exceed 280 characters.'),
});

export default function AutographWallPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [eventId, setEventId] = useState<string | null>(null);
  const [guestName, setGuestName] = useState<string | null>(null);

  useEffect(() => {
    setEventId(sessionStorage.getItem('guestEventId'));
    setGuestName(sessionStorage.getItem('guestName'));
  }, []);

  const form = useForm<z.infer<typeof autographFormSchema>>({
    resolver: zodResolver(autographFormSchema),
    defaultValues: { message: '' },
  });

  const autographsQuery = useMemoFirebase(() => {
    if (!firestore || !eventId) return null;
    return query(collection(firestore, 'events', eventId, 'autographs'), orderBy('createdAt', 'desc'));
  }, [firestore, eventId]);

  const { data: autographs, isLoading: isLoadingAutographs } = useCollection<Autograph>(autographsQuery);

  const handleSubmitMessage = async (values: z.infer<typeof autographFormSchema>) => {
    if (!firestore || !user || !eventId || !guestName) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not submit message. Please try again.' });
        return;
    }

    const autographData = {
        guestId: user.uid,
        guestName,
        message: values.message,
        createdAt: serverTimestamp(),
    };

    await addDoc(collection(firestore, 'events', eventId, 'autographs'), autographData);
    toast({ title: 'Message Left!', description: 'Thank you for your kind words.' });
    form.reset();
  };
  
  const isLoading = isUserLoading || isLoadingAutographs;

  return (
    <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Autograph Wall</CardTitle>
                    <CardDescription>A collection of well-wishes from your fellow guests.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : autographs && autographs.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {autographs.map(item => (
                                <Card key={item.id} className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-200 p-4 shadow-none border-yellow-300/50">
                                    <p className="text-lg font-['Caveat',_cursive] leading-tight">&quot;{item.message}&quot;</p>
                                    <p className="text-right text-sm font-semibold mt-2">- {item.guestName}</p>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 border-dashed border-2 rounded-lg">
                            <PenSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-2 text-muted-foreground">Be the first to leave a message!</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
         <div className="md:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Leave Your Message</CardTitle>
                    <CardDescription>Share a memory or a wish for the hosts.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmitMessage)} className="space-y-4">
                             <FormField control={form.control} name="message" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your Message</FormLabel>
                                    <FormControl>
                                        <Textarea rows={5} placeholder="e.g., Wishing you a lifetime of happiness!" {...field} disabled={!eventId} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <Button type="submit" className="w-full" disabled={!eventId || form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                                Sign the Guestbook
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
