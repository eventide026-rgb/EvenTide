
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
import { cn } from '@/lib/utils';
import { signOut } from 'firebase/auth';
import { CreditCard, LogOut, Settings, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export function DashboardHeader() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    if (auth) {
      const userName = sessionStorage.getItem('userName') || user?.displayName || user?.email || 'User';
      await signOut(auth);
      sessionStorage.clear();
      toast({
        title: "Goodbye!",
        description: `You have been successfully signed out, ${userName}.`,
      });
      router.push('/');
    }
  };

  const getRoleFromPath = (path: string): string => {
    if (path.startsWith('/owner-dashboard')) return 'Owner';
    if (path.startsWith('/planner-dashboard')) return 'Planner';
    if (path.startsWith('/vendor-dashboard')) return 'Vendor';
    if (path.startsWith('/ticketier-dashboard')) return 'Ticketier';
    if (path.startsWith('/cohost-dashboard')) return 'Co-host';
    return 'User';
  }

  const role = getRoleFromPath(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <div className="flex-1">
        {/* Search bar can be added here */}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="relative h-10 w-auto justify-start gap-2 rounded-full px-3"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user?.photoURL ?? `https://picsum.photos/seed/${user?.uid}/100`}
                alt={user?.displayName ?? 'User'}
              />
              <AvatarFallback>
                {user?.email?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-left">
              <span className="font-semibold text-sm truncate">
                {isUserLoading ? 'Loading...' : user?.displayName || user?.email}
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
          <DropdownMenuItem asChild>
            <Link href="/owner-dashboard/account">
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
