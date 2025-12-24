
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

const navItems = [
  { href: "/hotelier-dashboard", icon: Home, label: "Dashboard" },
  { href: "/hotelier-dashboard/my-hotels", icon: Building, label: "My Hotels" },
  { href: "/hotelier-dashboard/bookings", icon: BookMarked, label: "Bookings" },
  { href: "/hotelier-dashboard/calendar", icon: Calendar, label: "Calendar" },
];

export default function HotelierDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
                    isActive={pathname === item.href}
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
                <Link href="/hotelier-dashboard/profile" legacyBehavior passHref>
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
                <Link href="/" legacyBehavior passHref>
                    <SidebarMenuButton tooltip={{ children: 'Logout' }}>
                        <LogOut />
                        <span>Logout</span>
                    </SidebarMenuButton>
                </Link>
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
