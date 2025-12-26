
'use client';

import {
  Gift,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Music,
  Palette,
  ScanLine,
  User,
  Image as ImageIcon,
  PenSquare,
  Vote,
  Ticket,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/layout/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';


const sidebarNav = [
    {
        title: "My Event",
        icon: Home,
        links: [
            { href: "/guest-dashboard/my-invitations", label: "My Dashboard", icon: LayoutDashboard },
            { href: "/guest-dashboard/cards", label: "My Cards", icon: Ticket },
            { href: "/guest-dashboard/media-gallery", label: "Live Gallery", icon: ImageIcon },
            { href: "/guest-dashboard/find-my-seat", label: "Find My Seat", icon: User },
        ]
    },
    {
        title: "Interactive",
        icon: Palette,
        links: [
            { href: "/guest-dashboard/gift-registry", label: "Gift Registry", icon: Gift },
            { href: "/guest-dashboard/song-requests", label: "Song Requests", icon: Music },
            { href: "/guest-dashboard/polls", label: "Event Polls", icon: Vote },
            { href: "/guest-dashboard/autograph-wall", label: "Autograph Wall", icon: PenSquare },
        ]
    },
];

export default function GuestDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/guest-login');
    }
  };

  const isLinkActive = (href: string) => {
    if (href === "/guest-dashboard/my-invitations") {
        return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-screen bg-secondary text-foreground">
        <aside className="sticky top-0 h-screen w-16 flex flex-col items-center py-4 border-r bg-background z-20">
            <Link href="/guest-dashboard/my-invitations">
                <Logo />
            </Link>
            <Separator className="my-4" />
            <nav className="flex-1">
                <ul className="space-y-2">
                {sidebarNav.map((group) => (
                    <li key={group.title}>
                    <Popover>
                        <TooltipProvider>
                            <Tooltip>
                                <PopoverTrigger asChild>
                                <TooltipTrigger asChild>
                                    <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn("h-10 w-10 rounded-lg", isLinkActive(group.links[0].href) && "bg-accent")}
                                    >
                                    <group.icon className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <p>{group.title}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <PopoverContent side="right" align="start" className="ml-2 w-56 p-2">
                             <h3 className="px-3 py-2 text-sm font-semibold text-muted-foreground">{group.title}</h3>
                             <ul>
                                {group.links.map(link => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent", isLinkActive(link.href) ? "bg-accent text-accent-foreground" : "text-foreground/80"
                                            )}
                                        >
                                            <link.icon className="h-4 w-4" />
                                            <span>{link.label}</span>
                                        </Link>
                                    </li>
                                ))}
                             </ul>
                        </PopoverContent>
                    </Popover>
                    </li>
                ))}
                </ul>
            </nav>
            <div className="mt-auto flex flex-col items-center gap-4">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Link href="/guest-dashboard/profile">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src="https://picsum.photos/seed/guest-avatar/100" alt="Guest" />
                                <AvatarFallback>G</AvatarFallback>
                            </Avatar>
                        </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>My Profile</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={handleSignOut}>
                            <LogOut className="h-5 w-5" />
                        </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>Exit Event</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </aside>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {children}
        </main>
    </div>
  );
}
