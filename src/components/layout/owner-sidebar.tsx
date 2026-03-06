
'use client';

import {
  Calendar,
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
  Settings,
  Users,
  Bell,
  FileText,
  ClipboardList,
  ShieldCheck,
  ImageIcon,
  Camera,
  User,
  Hotel,
  Building,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/layout/logo';

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
            { href: "/owner-dashboard/program-menu", label: "Program & Menu", icon: ClipboardList },
            { href: "/owner-dashboard/seating-chart", label: "Seating Chart", icon: Users },
            { href: "/owner-dashboard/gift-registry", label: "Gift Registry", icon: Gift },
            { href: "/owner-dashboard/shot-list", label: "Shot List", icon: Camera },
            { href: "/owner-dashboard/media-library", label: "Media Library", icon: ImageIcon },
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
        icon: Building,
        links: [
            { href: "/owner-dashboard/find-planner", label: "Find a Planner", icon: PartyPopper },
            { href: "/owner-dashboard/find-hotel", label: "Find a Hotel", icon: Hotel },
            { href: "/owner-dashboard/find-venue", label: "Find a Venue", icon: Building },
        ]
    },
     {
        title: "Operations",
        icon: Settings,
        links: [
            { href: "/owner-dashboard/contracts-tasks", label: "Track Progress", icon: FileText },
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
            { href: "/owner-dashboard/checkin-monitor", label: "Check-in Monitor", icon: ShieldCheck },
        ]
    },
    {
        title: "Settings",
        icon: Settings,
        links: [
            { href: "/account", label: "My Account", icon: User },
            { href: "/owner-dashboard/account", label: "Account & Billing", icon: CreditCard },
        ]
    }
];

const FlyoutMenu = ({ navGroup }: { navGroup: typeof sidebarNav[0] }) => {
    const pathname = usePathname();

    const isLinkActive = (href: string) => {
        if (href === "/owner-dashboard" || href === "/account") {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };

    return (
        <div className="p-2">
            <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{navGroup.title}</h3>
            <ul className="space-y-1">
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
        </div>
    )
}

export function OwnerDashboardSidebar() {
    const pathname = usePathname();
    const isGroupActive = (groupLinks: typeof sidebarNav[0]['links']) => {
        return groupLinks.some(link => {
            if (link.href === "/owner-dashboard" || link.href === "/account") {
                return pathname === link.href;
            }
            return pathname.startsWith(link.href);
        });
      }

    return (
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
                        <PopoverContent side="right" align="start" className="ml-2 w-56 p-0 shadow-xl">
                            <FlyoutMenu navGroup={group} />
                        </PopoverContent>
                    </Popover>
                </SidebarMenuItem>
                ))}
            </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    );
}
