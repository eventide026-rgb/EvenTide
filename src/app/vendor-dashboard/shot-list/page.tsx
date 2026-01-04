
'use client';

import { useState, useMemo } from 'react';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc, documentId } from 'firebase/firestore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Camera, Check, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

type VendorContract = {
  id: string;
  eventId: string;
  eventName: string;
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
  const { toast } = useToast();

  const gigsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'vendorContracts'), where('vendorId', '==', user.uid), where('status', '==', 'accepted'));
  }, [firestore, user?.uid]);
  const { data: gigs, isLoading: isLoadingGigs } = useCollection<VendorContract>(gigsQuery);

  const shotListRef = useMemoFirebase(() => {
    if (!firestore || !selectedEventId) return null;
    return doc(firestore, 'events', selectedEventId, 'shotLists', 'main');
  }, [firestore, selectedEventId]);

  const { data: shotList, isLoading: isLoadingShotList } = useDoc<ShotList>(shotListRef);

  const handleToggleStatus = async (shotId: string) => {
    if (!shotListRef || !shotList?.shots) return;
    const updatedShots = shotList.shots.map(shot => 
        shot.id === shotId 
            ? { ...shot, status: shot.status === 'pending' ? 'completed' : 'pending' }
            : shot
    );
    
    await updateDoc(shotListRef, { shots: updatedShots });
    toast({ title: "Status Updated" });
  };
  
  const isLoading = isUserLoading || isLoadingGigs;
  const isLoadingData = isLoadingShotList;

  return (
    <div className="space-y-6">
      <header className="pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold font-headline">Photography Shot List</h1>
          <p className="text-muted-foreground">The client's list of must-have photos for the event.</p>
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
                {gigs?.map((gig) => (
                  <SelectItem key={gig.id} value={gig.eventId}>
                    {gig.eventName}
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
            <CardTitle>Client's Shot List</CardTitle>
            <CardDescription>Check off items as you capture them.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingData ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">Status</TableHead>
                                <TableHead>Shot Description</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {shotList && shotList.shots.length > 0 ? (
                                shotList.shots.map((shot) => (
                                    <TableRow key={shot.id} className={cn(shot.status === 'completed' && 'bg-muted/50')}>
                                        <TableCell>
                                             <Checkbox
                                                checked={shot.status === 'completed'}
                                                onCheckedChange={() => handleToggleStatus(shot.id)}
                                                aria-label={`Mark ${shot.description} as ${shot.status === 'completed' ? 'pending' : 'completed'}`}
                                            />
                                        </TableCell>
                                        <TableCell className={cn('font-medium', shot.status === 'completed' && 'line-through text-muted-foreground')}>
                                            {shot.description}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={2} className="h-24 text-center">
                                        The client has not created a shot list for this event yet.
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
