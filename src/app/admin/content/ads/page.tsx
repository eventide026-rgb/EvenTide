'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type AdRequest = {
  id: string;
  name: string;
  email: string;
  subject: string;
  concept: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
};

export default function AdvertisementsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const adRequestsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'adRequests'));
  }, [firestore]);

  const { data: adRequests, isLoading } = useCollection<AdRequest>(adRequestsQuery);

  const handleUpdateStatus = async (id: string, status: AdRequest['status']) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'adRequests', id);
    try {
      await updateDoc(docRef, { status });
      toast({
        title: 'Request Updated',
        description: `The ad request has been ${status}.`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update the ad request status.',
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advertisement Requests</CardTitle>
        <CardDescription>Review, approve, or reject user-submitted advertisement proposals.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Submitter</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adRequests && adRequests.length > 0 ? (
                  adRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="font-medium">{request.name}</div>
                        <div className="text-sm text-muted-foreground">{request.email}</div>
                      </TableCell>
                      <TableCell>{request.subject}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(request.status)}>{request.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {request.status === 'pending' && (
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" onClick={() => handleUpdateStatus(request.id, 'approved')}>
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(request.id, 'rejected')}>
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No advertisement requests found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
