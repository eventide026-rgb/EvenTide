
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
  FileText,
  Camera,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/layout/logo';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
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
            { href: "/owner-dashboard/program-menu", label: "Program & Menu", icon: ClipboardList },
            { href: "/owner-dashboard/shot-list", label: "Shot List", icon: Camera },
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
            { href: "/owner-dashboard/contracts-tasks", label: "Contracts & Tasks", icon: FileText },
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

    const isLinkActive = (href: string) => {
        if (href === "/owner-dashboard") {
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

export default function OwnerDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isGroupActive = (groupLinks: typeof sidebarNav[0]['links']) => {
    return groupLinks.some(link => {
        if (link.href === "/owner-dashboard") {
            return pathname === link.href;
        }
        return pathname.startsWith(link.href);
    });
  }

  return (
    <SidebarProvider>
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
                    <Link href="/owner-dashboard/account">
                      <SidebarMenuButton tooltip={{ children: 'Account & Billing' }} isActive={pathname === "/owner-dashboard/account"}>
                          <CreditCard />
                          <span>Account & Billing</span>
                      </SidebarMenuButton>
                    </Link>
                 </SidebarMenuItem>
           </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <div className="flex flex-col flex-1 h-full">
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

    