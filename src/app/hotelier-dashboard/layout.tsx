
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
} from "@/components/ui/sidebar";
import {
  Bell,
  BookMarked,
  Building,
  Calendar,
  Home,
  LogOut,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/layout/logo";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardRedirector } from "@/components/auth/dashboard-redirector";

const navItems = [
  { href: "/hotelier-dashboard", icon: Home, label: "Dashboard" },
  { href: "/hotelier-dashboard/my-hotels", icon: Building, label: "My Hotels" },
  { href: "/hotelier-dashboard/bookings", icon: BookMarked, label: "Bookings" },
  { href: "/hotelier-dashboard/calendar", icon: Calendar, label: "Calendar" },
];

export default function HotelierDashboardLayout({ children }: { children: React.ReactNode }) {
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
    if (href === "/hotelier-dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
    <DashboardRedirector expectedRole="Hotelier" />
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
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
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
                  <Link href="/hotelier-dashboard/profile">
                      <SidebarMenuButton
                          isActive={pathname === "/hotelier-dashboard/profile"}
                          tooltip={{ children: 'Profile' }}
                      >
                          <Avatar className="h-8 w-8">
                              <AvatarImage src="https://picsum.photos/seed/hotelier/100/100" alt="Hotelier" />
                              <AvatarFallback>H</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col text-left">
                              <span className="font-semibold">Majestic Hotels</span>
                              <span className="text-xs text-muted-foreground">hotelier@eventide.app</span>
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
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
    </>
  );
}
