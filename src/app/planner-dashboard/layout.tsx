
'use client';

import {
  Briefcase,
  Calendar,
  CheckSquare,
  Contact,
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  MessageCircle,
  Palette,
  Users,
  Bell,
  LogOut,
  User,
  ClipboardList,
  Percent,
  PartyPopper,
  Mail,
  Shirt,
  Vote,
  Music,
  Shield,
  Hotel,
  Building,
  Search,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/layout/logo';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { DashboardHeader } from '@/components/layout/dashboard-header';

const sidebarNav = [
    {
        title: "My Workspace",
        icon: Home,
        links: [
            { href: "/planner-dashboard", label: "Dashboard", icon: LayoutDashboard },
            { href: "/planner-dashboard/notifications", label: "Notifications", icon: Bell },
            { href: "/planner-dashboard/calendar", label: "Calendar", icon: Calendar },
            { href: "/planner-dashboard/analytics", label: "Analytics", icon: Percent },
            { href: "/planner-dashboard/my-network", label: "My Network", icon: Contact },
        ]
    },
    {
        title: "Event Management",
        icon: Settings,
        links: [
            { href: "/planner-dashboard/events", label: "Assigned Events", icon: Briefcase },
            { href: "/planner-dashboard/program-menu", label: "Program & Menu", icon: FileText },
            { href: "/planner-dashboard/seating-chart", label: "Seating Chart", icon: Users },
            { href: "/planner-dashboard/mood-board", label: "Mood Board", icon: Palette },
            { href: "/planner-dashboard/stationery-hub", label: "Stationery Hub", icon: Palette },
            { href: "/planner-dashboard/tasks", label: "Tasks", icon: ClipboardList },
        ]
    },
    {
        title: "Marketplace",
        icon: Briefcase,
        links: [
            { href: "/planner-dashboard/vendor-hub", label: "Vendor Hub", icon: Search },
            { href: "/planner-dashboard/fashion-designers", label: "Fashion Designers", icon: Shirt },
            { href: "/planner-dashboard/hotels", label: "Hotel Hub", icon: Hotel },
            { href: "/planner-dashboard/venues", label: "Venue Hub", icon: Building },
        ]
    },
    {
        title: "People Management",
        icon: Users,
        links: [
            { href: "/planner-dashboard/guests", label: "Guest List", icon: Users },
            { href: "/planner-dashboard/polls", label: "Event Polls", icon: Vote },
            { href: "/planner-dashboard/song-requests", label: "Song Requests", icon: Music },
            { href: "/planner-dashboard/team", label: "Team", icon: Contact },
            { href: "/planner-dashboard/contracts", label: "Vendor Contracts", icon: FileText },
        ]
    },
    {
        title: "Financials",
        icon: CreditCard,
        links: [
            { href: "/planner-dashboard/budget", label: "Budget & Expenses", icon: CreditCard },
        ]
    },
    {
        title: "Communication",
        icon: MessageCircle,
        links: [
            { href: "/planner-dashboard/announcements", label: "Announcements", icon: Bell },
            { href: "/planner-dashboard/chat", label: "Chat", icon: MessageCircle },
        ]
    },
    {
        title: "Live Operations",
        icon: CheckSquare,
        links: [
            { href: "/planner-dashboard/checkin-monitor", label: "Check-in Monitor", icon: CheckSquare },
            { href: "/planner-dashboard/manual-checkin", label: "Manual Check-in", icon: CheckSquare },
            { href: "/planner-dashboard/security-roster", label: "Security Roster", icon: Shield },
        ]
    },
];


const FlyoutMenu = ({ navGroup }: { navGroup: typeof sidebarNav[0] }) => {
    const pathname = usePathname();

    const isLinkActive = (href: string) => {
        if (href === "/planner-dashboard") {
            return pathname === href;
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

export default function PlannerDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isGroupActive = (groupLinks: typeof sidebarNav[0]['links']) => {
    return groupLinks.some(link => {
        if (link.href === "/planner-dashboard") {
            return pathname === link.href;
        }
        return pathname.startsWith(link.href);
    });
  }


  return (
    <SidebarProvider>
      <div className="flex h-screen w-full flex-row bg-muted/40 overflow-hidden">
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
        </Sidebar>
          <div className="flex flex-1 flex-col overflow-hidden">
            <DashboardHeader />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                {children}
            </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
