
'use client';

import { useState } from 'react';
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
import { Loader2, UserPlus, Search } from 'lucide-react';

/* -------------------------------- types -------------------------------- */

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
};

/* ----------------------------- form schema ------------------------------ */

const inviteFormSchema = z.object({
  email: z.string().email(),
  role: z.enum(['Planner', 'Co-host', 'Security']),
});

/* ---------------------------- helper query ------------------------------ */

async function findUserByEmail(
  firestore: any,
  email: string
): Promise<UserProfile | null> {
  const q = query(
    collection(firestore, 'users'),
    where('email', '==', email),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as UserProfile;
}

/* ============================ COMPONENT ============================ */

export function TeamManagement() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [foundUser, setFoundUser] = useState<UserProfile | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const form = useForm<z.infer<typeof inviteFormSchema>>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: { email: '', role: 'Planner' },
  });

  /* ---------------------------- events list ---------------------------- */

  const eventsQuery =
    firestore && user?.uid
      ? query(
          collection(firestore, 'events'),
          where('ownerId', '==', user.uid)
        )
      : undefined;

  const { data: events, isLoading: isLoadingEvents } =
    useCollection<Event>(eventsQuery);

  /* --------------------------- team members --------------------------- */

  const teamMembersQuery =
    firestore && selectedEventId
      ? query(
          collection(firestore, 'events', selectedEventId, 'teamMembers')
        )
      : undefined;

  const { data: teamMembers, isLoading: isLoadingTeam } =
    useCollection<TeamMember>(teamMembersQuery);

  /* --------------------------- search user ---------------------------- */

  const handleSearchUser = async () => {
    if (!firestore) return;
    setIsSearching(true);
    setFoundUser(null);

    const email = form.getValues('email');
    const result = await findUserByEmail(firestore, email);

    if (!result) {
      toast({
        variant: 'destructive',
        title: 'User not found',
        description: `No user with email ${email}`,
      });
    } else {
      setFoundUser(result);
    }

    setIsSearching(false);
  };

  /* --------------------------- send invite ---------------------------- */

  const handleSendInvite = async () => {
    if (!firestore || !user || !selectedEventId || !foundUser) return;

    const role = form.getValues('role');
    const event = events?.find(e => e.id === selectedEventId);
    if (!event) return;

    const teamMemberRef = doc(
      firestore,
      'events',
      selectedEventId,
      'teamMembers',
      foundUser.id
    );

    const batch = writeBatch(firestore);

    batch.set(teamMemberRef, {
      userId: foundUser.id,
      name: `${foundUser.firstName} ${foundUser.lastName}`,
      email: foundUser.email,
      role,
      status: 'pending',
      invitedAt: serverTimestamp(),
      eventId: selectedEventId,
      eventName: event.name,
      eventDate: event.eventDate,
    });

    const notificationRef = doc(
      collection(firestore, 'users', foundUser.id, 'notifications')
    );

    batch.set(notificationRef, {
      message: `You've been invited as ${role} for ${event.name}.`,
      link: '/planner-dashboard/invitations',
      read: false,
      createdAt: serverTimestamp(),
      userId: foundUser.id,
      eventId: selectedEventId,
    });

    await batch.commit();

    toast({ title: 'Invitation sent' });
    form.reset();
    setFoundUser(null);
  };

  /* ------------------------------- UI -------------------------------- */

  if (isUserLoading || isLoadingEvents) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* TEAM LIST */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Team Roster</CardTitle>
          <CardDescription>
            {selectedEventId
              ? 'Team members for selected event'
              : 'Select an event'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTeam ? (
            <Loader2 className="animate-spin" />
          ) : teamMembers && teamMembers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map(m => (
                  <TableRow key={m.id}>
                    <TableCell>{m.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{m.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge>{m.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16">
              <UserPlus className="mx-auto h-10 w-10 text-muted-foreground" />
              <p>No team members yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* INVITE FORM */}
      <Card>
        <CardHeader>
          <CardTitle>Invite Member</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedEventId}>
            <SelectTrigger>
              <SelectValue placeholder="Select event" />
            </SelectTrigger>
            <SelectContent>
              {events?.map(e => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Form {...form}>
            <form className="space-y-4 mt-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Planner">Planner</SelectItem>
                        <SelectItem value="Co-host">Co-host</SelectItem>
                        <SelectItem value="Security">Security</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <Button
                type="button"
                onClick={handleSearchUser}
                disabled={!selectedEventId || isSearching}
              >
                {isSearching ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Search />
                )}
              </Button>

              {foundUser && (
                <Button onClick={handleSendInvite} className="w-full">
                  Send Invite
                </Button>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
