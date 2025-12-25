
'use client';

import {
  Briefcase,
  Calendar,
  CheckSquare,
  Contact,
  CreditCard,
  Gift,
  Home,
  LayoutDashboard,
  MessageCircle,
  Music,
  Palette,
  PartyPopper,
  Percent,
  Search,
  Settings,
  Users,
  Bell,
  LogOut,
  ClipboardList,
  ShieldCheck,
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
import { NotificationBell } from '@/components/layout/notification-bell';

const sidebarNav = [
    {
        title: "My Workspace",
        icon: Home,
        links: [
            { href: "/owner-dashboard", label: "Dashboard", icon: LayoutDashboard },
            { href: "/owner-dashboard/analytics", label: "Analytics", icon: Percent },
            { href: "/owner-dashboard/calendar", label: "Calendar", icon: Calendar },
        ]
    },
    {
        title: "Event Planning",
        icon: PartyPopper,
        links: [
            { href: "/owner-dashboard/stationery-hub", label: "Stationery Hub", icon: Palette },
            { href: "/owner-dashboard/seating-chart", label: "Seating Chart", icon: Users },
            { href: "/owner-dashboard/gift-registry", label: "Gift Registry", icon: Gift },
            { href: "/owner-dashboard/song-requests", label: "Song Requests", icon: Music },
        ]
    },
    {
        title: "People Management",
        icon: Users,
        links: [
            { href: "/owner-dashboard/guests", label: "Guests", icon: Users },
            { href: "/owner-dashboard/team", label: "Team", icon: Contact },
        ]
    },
    {
        title: "Marketplace",
        icon: Briefcase,
        links: [
            { href: "/owner-dashboard/find-planner", label: "Find a Planner", icon: Search },
            { href: "/owner-dashboard/find-designer", label: "Fashion Hub", icon: Search },
        ]
    },
     {
        title: "Operations",
        icon: Settings,
        links: [
            { href: "/owner-dashboard/contracts-tasks", label: "Contracts & Tasks", icon: ClipboardList },
            { href: "/owner-dashboard/expenses", label: "Expenses", icon: CreditCard },
        ]
    },
    {
        title: "Communication",
        icon: MessageCircle,
        links: [
            { href: "/owner-dashboard/announcements", label: "Announcements", icon: Bell },
            { href: "/owner-dashboard/chat", label: "Chat", icon: MessageCircle },
        ]
    },
    {
        title: "Live Event",
        icon: ShieldCheck,
        links: [
            { href: "/owner-dashboard/checkin-monitor", label: "Check-in Monitor", icon: CheckSquare },
        ]
    },
];

const FlyoutMenu = ({ navGroup }: { navGroup: typeof sidebarNav[0] }) => {
    const pathname = usePathname();
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
                                pathname === link.href ? "bg-accent text-accent-foreground" : "text-foreground/80"
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

export default function OwnerDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        <aside className="sticky top-0 h-screen w-16 flex flex-col items-center py-4 border-r bg-background z-20">
          <Link href="/owner-dashboard">
            <Logo />
          </Link>
          <Separator className="my-4" />
          <nav className="flex-1">
            <ul className="space-y-2">
              {sidebarNav.map(group => (
                <li key={group.title}>
                  <Popover>
                    <Tooltip>
                      <PopoverTrigger asChild>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-10 w-10 rounded-lg",
                                group.links.some(l => pathname.startsWith(l.href)) ? "bg-accent text-accent-foreground" : ""
                            )}
                          >
                            <group.icon className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                      </PopoverTrigger>
                      <TooltipContent side="right" className="md:hidden">
                        {group.title}
                      </TooltipContent>
                    </Tooltip>
                    <PopoverContent side="right" align="start" className="ml-2 w-56 p-2 hidden md:block">
                       <FlyoutMenu navGroup={group} />
                    </PopoverContent>
                  </Popover>
                </li>
              ))}
            </ul>
          </nav>
           <div className="mt-auto flex flex-col items-center gap-4">
                 <NotificationBell />
                 <Tooltip>
                    <TooltipTrigger asChild>
                       <Link href="/owner-dashboard/account">
                           <Avatar className="h-9 w-9">
                                <AvatarImage src="https://picsum.photos/seed/owner-avatar/100" alt="Owner" />
                                <AvatarFallback>O</AvatarFallback>
                           </Avatar>
                       </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        Account & Billing
                    </TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                       <Button variant="ghost" size="icon" onClick={handleSignOut}>
                          <LogOut className="h-5 w-5" />
                       </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        Logout
                    </TooltipContent>
                </Tooltip>
           </div>
        </aside>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </TooltipProvider>
  );
}
