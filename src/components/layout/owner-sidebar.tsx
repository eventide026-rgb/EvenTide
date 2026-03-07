
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
import { useState } from 'react';

const sidebarNav = [
    {
        title: "My Workspace",
        icon: Home,
        links: [
            { href: "/owner", label: "Dashboard", icon: LayoutDashboard },
            { href: "/owner/analytics", label: "Analytics", icon: Percent },
            { href: "/owner/calendar", label: "Calendar", icon: Calendar },
        ]
    },
    {
        title: "Event Planning",
        icon: PartyPopper,
        links: [
            { href: "/owner/stationery-hub", label: "Stationery Hub", icon: Palette },
            { href: "/owner/program-menu", label: "Program & Menu", icon: ClipboardList },
            { href: "/owner/seating-chart", label: "Seating Chart", icon: Users },
            { href: "/owner/gift-registry", label: "Gift Registry", icon: Gift },
            { href: "/owner/shot-list", label: "Shot List", icon: Camera },
            { href: "/owner/media-library", label: "Media Library", icon: ImageIcon },
            { href: "/owner/song-requests", label: "Song Requests", icon: Music },
        ]
    },
    {
        title: "People Management",
        icon: Users,
        links: [
            { href: "/owner/guests", label: "Guests", icon: Users },
            { href: "/owner/team", label: "Team", icon: Contact },
        ]
    },
    {
        title: "Marketplace",
        icon: Building,
        links: [
            { href: "/owner/find-planner", label: "Find a Planner", icon: PartyPopper },
            { href: "/owner/find-hotel", label: "Find a Hotel", icon: Hotel },
            { href: "/owner/find-venue", label: "Find a Venue", icon: Building },
            { href: "/owner/find-designer", label: "Fashion Hub", icon: Users },
        ]
    },
     {
        title: "Operations",
        icon: Settings,
        links: [
            { href: "/owner/contracts-tasks", label: "Track Progress", icon: FileText },
            { href: "/owner/expenses", label: "Expenses", icon: CreditCard },
        ]
    },
    {
        title: "Communication",
        icon: MessageCircle,
        links: [
            { href: "/owner/announcements", label: "Announcements", icon: Bell },
            { href: "/owner/chat", label: "Chat", icon: MessageCircle },
        ]
    },
    {
        title: "Live Event",
        icon: ShieldCheck,
        links: [
            { href: "/owner/checkin-monitor", label: "Check-in Monitor", icon: ShieldCheck },
        ]
    },
    {
        title: "Settings",
        icon: Settings,
        links: [
            { href: "/account", label: "My Account", icon: User },
            { href: "/owner/account", label: "Account & Billing", icon: CreditCard },
        ]
    }
];

const FlyoutMenu = ({ navGroup, onClose }: { navGroup: typeof sidebarNav[0], onClose: () => void }) => {
    const pathname = usePathname();

    const isLinkActive = (href: string) => {
        if (href === "/owner" || href === "/account") {
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
                            onClick={onClose}
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
    const [openPopover, setOpenPopover] = useState<string | null>(null);

    const isGroupActive = (groupLinks: typeof sidebarNav[0]['links']) => {
        return groupLinks.some(link => {
            if (link.href === "/owner" || link.href === "/account") {
                return pathname === link.href;
            }
            return pathname.startsWith(link.href);
        });
      }

    return (
        <Sidebar>
            <SidebarHeader>
            <Link href="/" className="flex items-center gap-2 pl-2">
                <Logo />
            </Link>
            <SidebarTrigger />
            </SidebarHeader>
            <SidebarContent>
            <SidebarMenu>
                {sidebarNav.map(group => (
                <SidebarMenuItem key={group.title}>
                    <Popover 
                        open={openPopover === group.title} 
                        onOpenChange={(open) => setOpenPopover(open ? group.title : null)}
                    >
                        <PopoverTrigger asChild>
                        <SidebarMenuButton
                            tooltip={{ children: group.title }}
                            isActive={isGroupActive(group.links)}
                        >
                            <group.icon />
                            <span>{group.title}</span>
                        </SidebarMenuButton>
                        </PopoverTrigger>
                        <PopoverContent side="right" align="start" className="ml-2 w-56 p-0 shadow-xl border-border/40 overflow-hidden">
                            <FlyoutMenu navGroup={group} onClose={() => setOpenPopover(null)} />
                        </PopoverContent>
                    </Popover>
                </SidebarMenuItem>
                ))}
            </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    );
}
