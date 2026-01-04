'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, doc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Vote } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

type Poll = {
  id: string;
  question: string;
  options: { text: string; votes: number }[];
  voters: string[];
  totalVotes: number;
};

export default function EventPollsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [eventId, setEventId] = useState<string | null>(null);
  const [votingStates, setVotingStates] = useState<Record<string, { selectedOption: string | null, isSubmitting: boolean }>>({});

  useEffect(() => {
    setEventId(sessionStorage.getItem('guestEventId'));
  }, []);

  const pollsQuery = useMemoFirebase(() => {
    if (!firestore || !eventId) return null;
    return query(collection(firestore, 'events', eventId, 'polls'));
  }, [firestore, eventId]);
  const { data: polls, isLoading: isLoadingPolls } = useCollection<Poll>(pollsQuery);

  const handleVote = async (poll: Poll) => {
    const pollState = votingStates[poll.id];
    if (!firestore || !user || !pollState?.selectedOption) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select an option.' });
      return;
    }
    
    setVotingStates(prev => ({ ...prev, [poll.id]: { ...pollState, isSubmitting: true } }));

    const pollRef = doc(firestore, 'events', eventId!, 'polls', poll.id);
    const updatedOptions = poll.options.map(opt => 
        opt.text === pollState.selectedOption ? { ...opt, votes: (opt.votes || 0) + 1 } : opt
    );

    try {
        await updateDoc(pollRef, {
            options: updatedOptions,
            totalVotes: increment(1),
            voters: arrayUnion(user.uid),
        });
        toast({ title: 'Vote Cast!', description: 'Your vote has been counted.' });
    } catch (error) {
        console.error('Error casting vote:', error);
        toast({ variant: 'destructive', title: 'Vote Failed', description: 'Could not cast your vote.' });
    } finally {
         setVotingStates(prev => ({ ...prev, [poll.id]: { ...pollState, isSubmitting: false } }));
    }
  };

  const handleOptionChange = (pollId: string, value: string) => {
    setVotingStates(prev => ({ ...prev, [pollId]: { ...prev[pollId], selectedOption: value } }));
  }

  const isLoading = isUserLoading || isLoadingPolls;

  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
          <CardTitle>Live Event Polls</CardTitle>
          <CardDescription>Make your voice heard! Participate in live polls during the event.</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : polls && polls.length > 0 ? (
                <div className="space-y-8">
                    {polls.map(poll => {
                        const hasVoted = poll.voters?.includes(user?.uid || '');
                        const pollState = votingStates[poll.id] || { selectedOption: null, isSubmitting: false };
                        return (
                            <Card key={poll.id} className="bg-secondary/50">
                                <CardHeader>
                                    <CardTitle>{poll.question}</CardTitle>
                                    <CardDescription>{poll.totalVotes || 0} total votes</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {hasVoted ? (
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
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <RadioGroup
                                                value={pollState.selectedOption || ''}
                                                onValueChange={(value) => handleOptionChange(poll.id, value)}
                                            >
                                                {poll.options.map((option, index) => (
                                                    <div key={index} className="flex items-center space-x-2">
                                                        <RadioGroupItem value={option.text} id={`${poll.id}-${index}`} />
                                                        <Label htmlFor={`${poll.id}-${index}`}>{option.text}</Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                            <Button onClick={() => handleVote(poll)} disabled={!pollState.selectedOption || pollState.isSubmitting}>
                                                {pollState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                                Submit Vote
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                 <div className="text-center py-16 border-dashed border-2 rounded-lg">
                    <Vote className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-xl font-semibold">No active polls.</h3>
                    <p className="mt-1 text-muted-foreground">Check back later for live polls!</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
