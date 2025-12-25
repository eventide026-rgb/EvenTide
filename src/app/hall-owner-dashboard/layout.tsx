
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  BookMarked,
  Building,
  Calendar,
  Home,
  LogOut,
  User,
  Bell,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/layout/logo";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { NotificationBell } from "@/components/layout/notification-bell";

const navItems = [
  { href: "/hall-owner-dashboard", icon: Home, label: "Dashboard" },
  { href: "/hall-owner-dashboard/my-venues", icon: Building, label: "My Venues" },
  { href: "/hall-owner-dashboard/bookings", icon: BookMarked, label: "Bookings" },
  { href: "/hall-owner-dashboard/calendar", icon: Calendar, label: "Calendar" },
];

export default function HallOwnerDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  const isNavItemActive = (href: string) => {
    if (href === "/hall-owner-dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 font-headline font-bold text-lg">
                <Logo />
            </Link>
            <SidebarTrigger className="ml-auto" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={isNavItemActive(item.href)}
                    tooltip={{ children: item.label }}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <SidebarMenu>
            <SidebarMenuItem>
                <NotificationBell />
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="/hall-owner-dashboard/profile" legacyBehavior passHref>
                    <SidebarMenuButton 
                        isActive={pathname === "/hall-owner-dashboard/profile"}
                        tooltip={{ children: 'Profile' }}
                    >
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="https://picsum.photos/seed/hall-owner/100/100" alt="Hall Owner" />
                            <AvatarFallback>V</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-left">
                            <span className="font-semibold">Landmark Venues</span>
                            <span className="text-xs text-muted-foreground">venue@eventide.app</span>
                        </div>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton tooltip={{ children: 'Logout' }} onClick={handleSignOut}>
                    <LogOut />
                    <span>Logout</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
           </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <main className="min-h-svh bg-background p-4 sm:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
