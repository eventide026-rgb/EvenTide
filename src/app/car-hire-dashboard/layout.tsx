
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
  BookMarked,
  Car,
  Calendar,
  Home,
  LogOut,
  User,
  Bell,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/layout/logo";
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardRedirector } from "@/components/auth/dashboard-redirector";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/car-hire-dashboard", icon: Home, label: "Dashboard" },
  { href: "/car-hire-dashboard/my-cars", icon: Car, label: "My Cars" },
  { href: "/car-hire-dashboard/bookings", icon: BookMarked, label: "Bookings" },
  { href: "/car-hire-dashboard/calendar", icon: Calendar, label: "Calendar" },
];

export default function CarHireDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const auth = useAuth();
  const router = useRouter();
  const { user } = useUser();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
        // Fallback to a default name if display name is not set
        setUserName(user.displayName || sessionStorage.getItem('userName') || "Car Hire Service");
    }
  }, [user]);

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  const isNavItemActive = (href: string) => {
    if (href === "/car-hire-dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
    <DashboardRedirector expectedRole="Car Hire Service" />
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
                  <Link href="/car-hire-dashboard/profile">
                      <SidebarMenuButton
                          isActive={pathname === "/car-hire-dashboard/profile"}
                          tooltip={{ children: 'Profile' }}
                      >
                          <Avatar className="h-8 w-8">
                              <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/100`} alt={userName || ''} />
                              <AvatarFallback>{userName ? userName.charAt(0) : 'C'}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col text-left">
                              <span className="font-semibold">{userName}</span>
                              <span className="text-xs text-muted-foreground">{user?.email}</span>
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
