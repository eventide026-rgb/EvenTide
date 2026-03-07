'use client';

import { useState, useMemo } from 'react';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, setDoc } from 'firebase/firestore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, CirclePlus, Trash2, Camera, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

type Event = {
  id: string;
  name: string;
  ownerId: string;
};

type Shot = {
  id: string;
  description: string;
  status: 'pending' | 'completed';
};

type ShotList = {
    shots: Shot[];
}

export default function ShotListPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [newShot, setNewShot] = useState('');
  const { toast } = useToast();

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'events'), where('ownerId', '==', user.uid));
  }, [firestore, user?.uid]);
  const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

  const shotListRef = useMemoFirebase(() => {
    if (!firestore || !selectedEventId) return null;
    return doc(firestore, 'events', selectedEventId, 'shotLists', 'main');
  }, [firestore, selectedEventId]);

  const { data: shotList, isLoading: isLoadingShotList } = useDoc<ShotList>(shotListRef);

  const handleAddShot = () => {
    if (!newShot.trim() || !shotListRef) return;
    const currentShots = shotList?.shots || [];
    const newShotData: Shot = {
        id: new Date().toISOString(), // Simple unique ID
        description: newShot,
        status: 'pending'
    };
    
    setDocumentNonBlocking(shotListRef, { shots: [...currentShots, newShotData] }, { merge: true });
    setNewShot('');
    toast({ title: "Shot Added", description: `"${newShot}" has been added to the list.`});
  };

  const handleRemoveShot = (shotId: string) => {
    if (!shotListRef || !shotList?.shots) return;
    const updatedShots = shotList.shots.filter(shot => shot.id !== shotId);
    setDocumentNonBlocking(shotListRef, { shots: updatedShots }, { merge: true });
    toast({ title: "Shot Removed"});
  }

  const isLoading = isUserLoading || isLoadingEvents;
  const isLoadingData = isLoadingShotList;

  return (
    <div className="space-y-6">
      <header className="pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold font-headline">Photography Shot List</h1>
          <p className="text-muted-foreground">Create a list of must-have photos for your photographer.</p>
        </div>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Select an Event</CardTitle>
        </CardHeader>
        <CardContent>
          <Label>Event</Label>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Select onValueChange={setSelectedEventId} value={selectedEventId || ''}>
              <SelectTrigger className="w-full md:w-1/2">
                <SelectValue placeholder="Select an event..." />
              </SelectTrigger>
              <SelectContent>
                {events?.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedEventId && (
        <Card>
          <CardHeader>
            <CardTitle>Must-Have Shots</CardTitle>
            <CardDescription>Add, view, and remove items from your photographer's checklist.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Input
                value={newShot}
                onChange={(e) => setNewShot(e.target.value)}
                placeholder="e.g., Bride and groom first look"
              />
              <Button onClick={handleAddShot} disabled={!newShot.trim()}>
                <CirclePlus className="mr-2 h-4 w-4" /> Add Shot
              </Button>
            </div>

            {isLoadingData ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Shot Description</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {shotList && shotList.shots && shotList.shots.length > 0 ? (
                                shotList.shots.map((shot) => (
                                    <TableRow key={shot.id}>
                                        <TableCell>{shot.description}</TableCell>
                                        <TableCell>
                                            <Badge variant={shot.status === 'completed' ? 'default' : 'outline'} className={shot.status === 'completed' ? 'bg-green-600' : ''}>
                                                {shot.status === 'completed' ? <CheckCircle className="mr-1 h-3 w-3" /> : <Camera className="mr-1 h-3 w-3" />}
                                                {shot.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveShot(shot.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        No shots added yet. Use the input above to create your list.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
