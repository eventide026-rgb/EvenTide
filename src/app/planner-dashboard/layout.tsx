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
  Scan,
  Search,
  Users,
  Bell,
  LogOut,
  Settings,
  User,
  ClipboardList,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/layout/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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
        title: "My Workspace",
        icon: Home,
        links: [
            { href: "/planner-dashboard", label: "Dashboard", icon: LayoutDashboard },
            { href: "/planner-dashboard/notifications", label: "Notifications", icon: Bell },
            { href: "/planner-dashboard/calendar", label: "Calendar", icon: Calendar },
            { href: "/planner-dashboard/profile", label: "My Profile", icon: User },
        ]
    },
    {
        title: "Event Management",
        icon: Settings,
        links: [
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
            { href: "/planner-dashboard/fashion-designers", label: "Fashion Designers", icon: Search },
        ]
    },
    {
        title: "People Management",
        icon: Users,
        links: [
            { href: "/planner-dashboard/guests", label: "Guest List", icon: Users },
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
        title: "Live Operations",
        icon: CheckSquare,
        links: [
            { href: "/planner-dashboard/checkin-monitor", label: "Check-in Monitor", icon: Scan },
            { href: "/planner-dashboard/manual-checkin", label: "Manual Check-in", icon: CheckSquare },
        ]
    },
];


const FlyoutMenu = ({ navGroup }: { navGroup: typeof sidebarNav[0] }) => {
    const pathname = usePathname();
    return (
        <div className="absolute left-full top-0 ml-2 w-56 origin-left rounded-md bg-background border shadow-lg p-2 transition-all duration-200 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
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
        </div>
    )
}

export default function PlannerDashboardLayout({ children }: { children: React.ReactNode }) {
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
          <Link href="/planner-dashboard">
            <Logo />
          </Link>
          <Separator className="my-4" />
          <nav className="flex-1">
            <ul className="space-y-2">
              {sidebarNav.map(group => (
                <li key={group.title} className="group relative">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={group.links[0].href}
                        className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-accent",
                            group.links.some(l => pathname.startsWith(l.href)) ? "bg-accent text-accent-foreground" : ""
                        )}
                      >
                        <group.icon className="h-5 w-5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="md:hidden">
                      {group.title}
                    </TooltipContent>
                  </Tooltip>
                  <div className="hidden md:block">
                     <FlyoutMenu navGroup={group} />
                  </div>
                </li>
              ))}
            </ul>
          </nav>
           <div className="mt-auto flex flex-col items-center gap-4">
                 <Tooltip>
                    <TooltipTrigger asChild>
                       <Link href="/planner-dashboard/profile">
                           <Avatar className="h-9 w-9">
                                <AvatarImage src="https://picsum.photos/seed/planner-avatar/100" alt="Planner" />
                                <AvatarFallback>P</AvatarFallback>
                           </Avatar>
                       </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        My Profile
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
