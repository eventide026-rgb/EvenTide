
'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, doc, updateDoc } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useDebounce } from 'use-debounce';

type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: any;
};

const availableRoles = [
  'Owner',
  'Planner',
  'Hotelier',
  'Hall Owner',
  'Car Hire Service',
  'Ticketier',
  'Vendor',
  'Fashion Designer',
  'Security'
];

export function UserManagementTable() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "users"));
  }, [firestore]);

  const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!debouncedSearchTerm) return users;
    const lowercasedFilter = debouncedSearchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.firstName.toLowerCase().includes(lowercasedFilter) ||
        user.lastName.toLowerCase().includes(lowercasedFilter) ||
        user.email.toLowerCase().includes(lowercasedFilter)
    );
  }, [users, debouncedSearchTerm]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!firestore) return;
    const userDocRef = doc(firestore, "users", userId);
    try {
      await updateDoc(userDocRef, { role: newRole });
      toast({
        title: 'Role Updated',
        description: `User role has been successfully changed to ${newRole}.`,
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update the user role.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) => handleRoleChange(user.id, value)}
                      disabled={!availableRoles.includes(user.role)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
