
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
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter
} from '@/components/ui/sidebar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { useEffect, useState } from 'react';

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

const FlyoutMenu = ({ navGroup }: { navGroup: typeof sidebarNav[0] }) => {
    const pathname = usePathname();

    const isLinkActive = (href: string) => {
        if (href === "/guest-dashboard/my-invitations") {
            return pathname === href || pathname === '/guest-dashboard';
        }
        return pathname.startsWith(href);
    };

    return (
        <>
            <h3 className="px-3 py-2 text-sm font-semibold text-muted-foreground">{navGroup.title}</h3>
            <ul>
                 {navGroup.links.map(link => (
                    <li key={link.href}>
                         <Link
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                                isLinkActive(link.href) ? "bg-accent text-accent-foreground" : "text-foreground/80"
                            )}
                        >
                            <link.icon className="h-4 w-4" />
                            <span>{link.label}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </>
    )
}

export function GuestDashboardSidebar() {
  const pathname = usePathname();
  const auth = useAuth();
  const router = useRouter();
  const { user } = useUser();
  const [guestName, setGuestName] = useState<string | null>(null);

  useEffect(() => {
    if(user) {
        setGuestName(sessionStorage.getItem('guestName'));
    }
  }, [user]);

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/guest-login');
    }
  };

  const isGroupActive = (groupLinks: typeof sidebarNav[0]['links']) => {
    return groupLinks.some(link => {
        if (link.href === "/guest-dashboard/my-invitations") {
            return pathname === link.href || pathname === '/guest-dashboard';
        }
        return pathname.startsWith(link.href);
    });
  }

  return (
    <SidebarProvider>
        <div className="flex h-screen w-full flex-row bg-muted/40">
            <Sidebar>
                <SidebarHeader>
                    <Link href="/">
                        <Logo />
                    </Link>
                    <SidebarTrigger />
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                    {sidebarNav.map(group => (
                    <SidebarMenuItem key={group.title}>
                        <Popover>
                            <PopoverTrigger asChild>
                            <SidebarMenuButton
                                tooltip={{ children: group.title }}
                                isActive={isGroupActive(group.links)}
                            >
                                <group.icon />
                                <span>{group.title}</span>
                            </SidebarMenuButton>
                            </PopoverTrigger>
                            <PopoverContent side="right" align="start" className="ml-2 w-56 p-0">
                                <FlyoutMenu navGroup={group} />
                            </PopoverContent>
                        </Popover>
                    </SidebarMenuItem>
                    ))}
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <Link href="/guest-dashboard/profile">
                                <SidebarMenuButton
                                    isActive={pathname === "/guest-dashboard/profile"}
                                    tooltip={{ children: 'Profile' }}
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/100`} alt="Guest" />
                                        <AvatarFallback>{guestName ? guestName[0] : 'G'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col text-left">
                                        <span className="font-semibold">{guestName || 'Guest'}</span>
                                        <span className="text-xs text-muted-foreground">Viewing event</span>
                                    </div>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton tooltip={{ children: 'Exit Event' }} onClick={handleSignOut}>
                                <LogOut />
                                <span>Exit Event</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
        </div>
    </SidebarProvider>
  );
}
