
'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, deleteDoc, doc, documentId } from 'firebase/firestore';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2, Vote } from 'lucide-react';
import { Label } from '@/components/ui/label';

type EventPlannerAssignment = {
    id: string;
    eventId: string;
};

type Event = {
  id: string;
  name: string;
};

type Poll = {
  id: string;
  question: string;
  options: { text: string; votes: number }[];
  voters: string[];
  totalVotes: number;
};

const pollFormSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters.'),
  options: z.array(z.object({ text: z.string().min(1, 'Option cannot be empty.') })).min(2, 'At least two options are required.'),
});

export default function PollsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof pollFormSchema>>({
    resolver: zodResolver(pollFormSchema),
    defaultValues: {
      question: '',
      options: [{ text: '' }, { text: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
  });

  const plannerAssignmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'planners'), where('plannerId', '==', user.uid));
  }, [firestore, user?.uid]);
  const { data: assignments, isLoading: isLoadingAssignments } = useCollection<EventPlannerAssignment>(plannerAssignmentsQuery);
  const eventIds = useMemo(() => assignments?.map(a => a.eventId) || [], [assignments]);

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || eventIds.length === 0) return null;
    return query(collection(firestore, 'events'), where(documentId(), 'in', eventIds));
  }, [firestore, eventIds]);
  const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

  const pollsQuery = useMemoFirebase(() => {
    if (!firestore || !selectedEventId) return null;
    return query(collection(firestore, 'events', selectedEventId, 'polls'));
  }, [firestore, selectedEventId]);
  const { data: polls, isLoading: isLoadingPolls } = useCollection<Poll>(pollsQuery);

  const handleCreatePoll = async (values: z.infer<typeof pollFormSchema>) => {
    if (!firestore || !selectedEventId) return;
    const pollData = {
      question: values.question,
      options: values.options.map(opt => ({ text: opt.text, votes: 0 })),
      voters: [],
      totalVotes: 0,
      createdAt: new Date(),
    };
    await addDoc(collection(firestore, 'events', selectedEventId, 'polls'), pollData);
    toast({ title: 'Poll Created', description: 'Your new poll is now live for guests.' });
    form.reset();
  };

  const handleDeletePoll = async (pollId: string) => {
    if (!firestore || !selectedEventId) return;
    await deleteDoc(doc(firestore, 'events', selectedEventId, 'polls', pollId));
    toast({ title: 'Poll Deleted', description: 'The poll has been removed.' });
  };

  const isLoading = isLoadingAssignments || isLoadingEvents;

  return (
    <div className="grid md:grid-cols-3 gap-8 items-start">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Live Poll Results</CardTitle>
            <CardDescription>
              {selectedEventId ? 'Real-time results from your event polls.' : 'Select an event to view polls.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingPolls && selectedEventId ? (
                <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : polls && polls.length > 0 ? (
                polls.map(poll => (
                    <div key={poll.id} className="border p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                            <h3 className="font-semibold">{poll.question}</h3>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeletePoll(poll.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{poll.totalVotes} total votes</p>
                        <div className="space-y-3">
                            {poll.options.map((option, index) => {
                                const percentage = poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0;
                                return (
                                    <div key={index}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>{option.text}</span>
                                            <span>{option.votes} ({percentage.toFixed(0)}%)</span>
                                        </div>
                                        <Progress value={percentage} />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))
            ) : (
                 <div className="text-center py-16 border-dashed border-2 rounded-lg">
                    <Vote className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-xl font-semibold">No polls active.</h3>
                    <p className="mt-1 text-muted-foreground">Use the form to create a poll.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Event</CardTitle>
          </CardHeader>
          <CardContent>
             {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <Select onValueChange={setSelectedEventId} value={selectedEventId || ''}>
                    <SelectTrigger><SelectValue placeholder="Choose an event" /></SelectTrigger>
                    <SelectContent>
                        {events?.map(event => <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Create New Poll</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreatePoll)} className="space-y-4">
                <FormField control={form.control} name="question" render={({ field }) => (
                  <FormItem><FormLabel>Question</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <div>
                  <Label>Options</Label>
                  {fields.map((field, index) => (
                    <FormField key={field.id} control={form.control} name={`options.${index}.text`} render={({ field }) => (
                      <FormItem className="mt-2">
                        <div className="flex items-center gap-2">
                          <FormControl><Input {...field} /></FormControl>
                          {fields.length > 2 && <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />
                  ))}
                  <Button type="button" size="sm" variant="outline" className="mt-2" onClick={() => append({ text: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Option
                  </Button>
                </div>
                <Button type="submit" className="w-full" disabled={!selectedEventId || form.formState.isSubmitting}>
                   {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                   Create Poll
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
