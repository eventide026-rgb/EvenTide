

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import {
  collection,
  query,
  where,
  doc,
  writeBatch,
  getDocs,
  limit,
  serverTimestamp,
  documentId
} from 'firebase/firestore';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Search, Trash2 } from 'lucide-react';
import { Label } from '../ui/label';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


type Event = {
  id: string;
  name: string;
  ownerId: string;
  eventDate: any;
};

type UserProfile = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
};

type TeamMember = {
    id: string;
    userId: string;
    name: string;
    email: string;
    role: 'Planner' | 'Co-host' | 'Security';
    status: 'pending' | 'accepted' | 'declined';
}

const inviteFormSchema = z.object({
  email: z.string().email('Please enter a valid email to search.'),
  role: z.enum(['Planner', 'Co-host', 'Security'], {
    required_error: 'Please select a role for the team member.',
  }),
});

// A simplified findUserByEmail server action mock
const findUserByEmail = async (firestore: any, email: string): Promise<UserProfile | null> => {
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('email', '==', email), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() } as UserProfile;
}


export function TeamManagement() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [foundUser, setFoundUser] = useState<UserProfile | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const form = useForm<z.infer<typeof inviteFormSchema>>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: { email: '', role: 'Co-host' },
  });

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'events'), where('ownerId', '==', user.uid));
  }, [firestore, user?.uid]);

  const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

  const teamMembersQuery = useMemoFirebase(() => {
      if(!firestore || !selectedEventId) return null;
      // This path needs to be updated if you store all team members in one subcollection
      return query(collection(firestore, 'events', selectedEventId, 'teamMembers'));
  }, [firestore, selectedEventId]);

  const {data: teamMembers, isLoading: isLoadingTeam} = useCollection<TeamMember>(teamMembersQuery);

  const handleSearchUser = async () => {
      if (!firestore) return;
      const email = form.getValues('email');
      if(!email) {
          form.setError('email', {message: 'Email cannot be empty.'});
          return;
      }
      setIsSearching(true);
      setFoundUser(null);
      const userResult = await findUserByEmail(firestore, email);
      if(userResult) {
          if (userResult.role === 'Owner') {
            toast({ variant: 'destructive', title: 'Invalid Role', description: 'Event Owners cannot be invited as team members.'});
          } else {
            setFoundUser(userResult);
          }
      } else {
          toast({ variant: 'destructive', title: 'User Not Found', description: `No user with email ${email} exists on EvenTide.`});
      }
      setIsSearching(false);
  }

  const handleSendInvite = async () => {
    if (!firestore || !user || !selectedEventId || !foundUser) return;
    const currentEvent = events?.find(e => e.id === selectedEventId);
    if (!currentEvent) return;

    const role = foundUser.role;
    const batch = writeBatch(firestore);
    
    // Use foundUser.id as the document ID for the team member for easy lookup
    const teamMemberRef = doc(firestore, 'events', selectedEventId, 'teamMembers', foundUser.id);
    
    // This is the data contract that MUST be fulfilled
    const teamMemberData = {
        userId: foundUser.id,
        name: `${foundUser.firstName} ${foundUser.lastName}`,
        email: foundUser.email,
        role: role,
        status: 'pending' as const,
        invitedAt: serverTimestamp(),
        // Critical fields for the invitation inbox
        eventId: selectedEventId,
        eventName: currentEvent.name,
        eventDate: currentEvent.eventDate,
    };
    batch.set(teamMemberRef, teamMemberData);

    const notificationRef = doc(collection(firestore, 'users', foundUser.id, 'notifications'));
    batch.set(notificationRef, {
        message: `You've been invited to be a ${role} for ${currentEvent.name}.`,
        link: `/planner-dashboard/invitations`, // Correct link for planners/vendors
        read: false,
        createdAt: serverTimestamp(),
        userId: foundUser.id,
        eventId: selectedEventId
    });
    
    batch.commit()
      .then(() => {
        toast({ title: 'Invitation Sent!', description: `${foundUser.firstName} has been invited as a ${role}.`});
        setFoundUser(null);
        form.reset();
      })
      .catch((serverError) => {
        const contextualError = new FirestorePermissionError({
          path: teamMemberRef.path,
          operation: 'create',
          requestResourceData: {
            teamMember: teamMemberData,
          },
        });
        errorEmitter.emit('permission-error', contextualError);
      });
  }

  const isLoading = isUserLoading || isLoadingEvents;

  return (
    <div className="grid md:grid-cols-3 gap-8 items-start h-full">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Team Roster</CardTitle>
           <CardDescription>
            {selectedEventId ? `Showing team for your selected event.` : "Select an event to see the team list."}
          </CardDescription>
        </CardHeader>
        <CardContent>
            {isLoadingTeam && <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>}
            {!isLoadingTeam && teamMembers && teamMembers.length > 0 ? (
                 <div className="rounded-md border">
                    <Table>
                        <TableHeader><TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                            {teamMembers.map(member => (
                                <TableRow key={member.id}>
                                    <TableCell>
                                      <div className='font-medium'>{member.name}</div>
                                      <div className="text-sm text-muted-foreground">{member.email}</div>
                                    </TableCell>
                                    <TableCell><Badge variant="secondary">{member.role}</Badge></TableCell>
                                    <TableCell>
                                        <Badge variant={member.status === 'pending' ? 'outline' : member.status === 'accepted' ? 'default' : 'destructive'}>
                                            {member.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : !isLoadingTeam && (
                 <div className="text-center py-16 border-dashed border-2 rounded-lg">
                    <UserPlus className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-xl font-semibold">Your team is empty</h3>
                    <p className="mt-1 text-muted-foreground">
                        {selectedEventId ? "Use the form to start inviting team members." : "Select an event to begin."}
                    </p>
                </div>
            )}
        </CardContent>
      </Card>
       <div className="md:col-span-1 space-y-6">
         <Card>
            <CardHeader>
                <CardTitle>Invite Team Member</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="space-y-4">
                    <div>
                        <Label>1. Select Event</Label>
                         {isLoading ? (
                            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /><span>Loading events...</span></div>
                        ) : (
                            <Select onValueChange={setSelectedEventId} value={selectedEventId || ''}>
                            <SelectTrigger><SelectValue placeholder="Choose an event" /></SelectTrigger>
                            <SelectContent>
                                {events && events.length > 0 ? (
                                events.map((event) => (<SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>))
                                ) : (
                                <SelectItem value="no-events" disabled>Create an event first</SelectItem>
                                )}
                            </SelectContent>
                            </Select>
                        )}
                    </div>
                     <Form {...form}>
                        <form onSubmit={e => e.preventDefault()} className="space-y-4 pt-4 border-t">
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>2. Find User by Email</FormLabel>
                                    <div className='flex gap-2'>
                                        <FormControl><Input type="email" placeholder="planner@example.com" {...field} disabled={!selectedEventId} /></FormControl>
                                        <Button type="button" onClick={handleSearchUser} disabled={!selectedEventId || isSearching}>
                                            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            {foundUser && (
                                <Card className="bg-muted p-4">
                                    <p className='font-semibold'>{foundUser.firstName} {foundUser.lastName}</p>
                                    <p className='text-sm text-muted-foreground'>{foundUser.email}</p>
                                     <Badge variant="outline" className='mt-2'>Role: {foundUser.role}</Badge>
                                    <Button className='w-full mt-4' onClick={handleSendInvite}>Send Invite as {foundUser.role}</Button>
                                </Card>
                            )}
                        </form>
                    </Form>
                 </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
