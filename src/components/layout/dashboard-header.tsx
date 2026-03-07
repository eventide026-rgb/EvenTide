'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { signOut } from 'firebase/auth';
import { CreditCard, LogOut, Search, Settings, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { NotificationBell } from './notification-bell';
import { useEffect, useState } from 'react';

export function DashboardHeader() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setUserName(sessionStorage.getItem('userName'));
    }
  }, [user]);

  const handleSignOut = async () => {
    if (auth) {
      const storedUserName = sessionStorage.getItem('userName') || user?.displayName || user?.email || 'User';
      await signOut(auth);
      sessionStorage.clear();
      toast({
        title: "Goodbye!",
        description: `You have been successfully signed out, ${storedUserName}.`,
      });
      router.push('/');
    }
  };

  const getRoleFromPath = (path: string): string => {
    if (path.startsWith('/owner')) return 'Owner';
    if (path.startsWith('/planner')) return 'Planner';
    if (path.startsWith('/vendor')) return 'Vendor';
    if (path.startsWith('/ticketier')) return 'Ticketier';
    if (path.startsWith('/cohost')) return 'Co-host';
    if (path.startsWith('/guest')) return 'Guest';
    return 'User';
  }

  const role = getRoleFromPath(pathname);
  const isGuest = role === 'Guest';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
       <div className="relative flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
          />
        </div>
      <div className="flex flex-1 items-center justify-end gap-2">
        <NotificationBell />
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button
                variant="outline"
                className="relative h-10 w-auto justify-start gap-2 rounded-full px-3"
            >
                <Avatar className="h-8 w-8">
                <AvatarImage
                    src={user?.photoURL ?? `https://picsum.photos/seed/${user?.uid}/100`}
                    alt={userName ?? 'User'}
                />
                <AvatarFallback>
                    {userName?.[0].toUpperCase() || user?.email?.[0].toUpperCase()}
                </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col text-left">
                <span className="font-semibold text-sm truncate">
                    {isUserLoading ? 'Loading...' : userName || user?.email}
                </span>
                <Badge variant="secondary" className="w-fit">{role}</Badge>
                </div>
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href="/account">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
                </Link>
            </DropdownMenuItem>
            {!isGuest && (
              <DropdownMenuItem asChild>
                  <Link href="/owner/account">
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Billing</span>
                  </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
            </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
