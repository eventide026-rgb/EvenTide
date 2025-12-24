
'use client';

import {
  Briefcase,
  Calendar,
  Contact,
  FileText,
  Home,
  LayoutDashboard,
  MessageCircle,
  Palette,
  Users,
  Bell,
  LogOut,
  User,
  Camera,
  ClipboardList,
  Upload,
  ChefHat,
  Mic,
  Paintbrush,
  Shirt,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/layout/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';


const baseNav = [
    {
        title: "Workspace",
        icon: Home,
        links: [
            { href: "/vendor-dashboard", label: "Dashboard", icon: LayoutDashboard },
            { href: "/vendor-dashboard/notifications", label: "Notifications", icon: Bell },
            { href: "/vendor-dashboard/my-gigs", label: "My Gigs", icon: Briefcase },
            { href: "/vendor-dashboard/proposals", label: "Proposals", icon: FileText },
        ]
    },
    {
        title: "Collaboration",
        icon: Users,
        links: [
            { href: "/vendor-dashboard/chat", label: "Chat", icon: MessageCircle },
            { href: "/vendor-dashboard/calendar", label: "Calendar", icon: Calendar },
        ]
    },
];

const specialtyNavs: Record<string, any[]> = {
    "Photographer": [
        { href: "/vendor-dashboard/shot-list", label: "Shot List", icon: ClipboardList },
        { href: "/vendor-dashboard/upload-media", label: "Upload Media", icon: Upload },
    ],
    "Videographer": [
        { href: "/vendor-dashboard/shot-list", label: "Shot List", icon: ClipboardList },
        { href: "/vendor-dashboard/upload-media", label: "Upload Media", icon: Upload },
    ],
    "Caterer": [
        { href: "/vendor-dashboard/menu-planner", label: "Menu Planner", icon: ChefHat },
    ],
    "MC": [
        { href: "/vendor-dashboard/program-viewer", label: "Program Viewer", icon: Mic },
    ],
    "Decorator": [
        { href: "/vendor-dashboard/mood-board", label: "Mood Board", icon: Paintbrush },
    ],
    "Fashion Designer": [
         { href: "/vendor-dashboard/my-commissions", label: "My Commissions", icon: Shirt },
    ]
}


const FlyoutMenu = ({ navGroup }: { navGroup: typeof baseNav[0] }) => {
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

export default function VendorDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();
  const firestore = useFirestore();

  // This is a simplified example. In a real app, the vendor's specialty
  // would be stored in their Firestore profile document.
  const [specialty, setSpecialty] = useState("Photographer"); // Default or fetched from user profile

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile } = useDoc(userDocRef);

  useEffect(() => {
    if (userProfile && userProfile.specialty) {
        setSpecialty(userProfile.specialty);
    } else if (userProfile && userProfile.role === 'Fashion Designer') {
        setSpecialty('Fashion Designer');
    }
  }, [userProfile]);

  const specialtyLinks = specialtyNavs[specialty] || [];

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        <aside className="sticky top-0 h-screen w-16 flex flex-col items-center py-4 border-r bg-background z-20">
          <Link href="/vendor-dashboard">
            <Logo />
          </Link>
          <Separator className="my-4" />
          <nav className="flex-1">
            <ul className="space-y-2">
              {baseNav.map(group => (
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
               {specialtyLinks.length > 0 && <Separator className="my-2" />}
                {specialtyLinks.map(link => (
                     <li key={link.href} className="group relative">
                        <Tooltip>
                            <TooltipTrigger asChild>
                            <Link
                                href={link.href}
                                className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-accent",
                                    pathname.startsWith(link.href) ? "bg-accent text-accent-foreground" : ""
                                )}
                            >
                                <link.icon className="h-5 w-5" />
                            </Link>
                            </TooltipTrigger>
                             <TooltipContent side="right">
                                {link.label}
                            </TooltipContent>
                        </Tooltip>
                    </li>
                ))}
            </ul>
          </nav>
           <div className="mt-auto flex flex-col items-center gap-4">
                 <Tooltip>
                    <TooltipTrigger asChild>
                       <Link href="/vendor-dashboard/profile">
                           <Avatar className="h-9 w-9">
                                <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/100`} alt="Vendor" />
                                <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                           </Avatar>
                       </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        My Profile
                    </TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                       <Link href="/">
                            <Button variant="ghost" size="icon">
                                <LogOut className="h-5 w-5" />
                            </Button>
                       </Link>
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
