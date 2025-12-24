
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
  BookMarked,
  Car,
  Calendar,
  Home,
  LogOut,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/layout/logo";

const navItems = [
  { href: "/car-hire-dashboard", icon: Home, label: "Dashboard" },
  { href: "/car-hire-dashboard/my-cars", icon: Car, label: "My Cars" },
  { href: "/car-hire-dashboard/bookings", icon: BookMarked, label: "Bookings" },
  { href: "/car-hire-dashboard/calendar", icon: Calendar, label: "Calendar" },
];

export default function CarHireDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isNavItemActive = (href: string) => {
    if (href === "/car-hire-dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Link href="/car-hire-dashboard" className="flex items-center gap-2 font-headline font-bold text-lg">
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
                <Link href="/car-hire-dashboard/profile" legacyBehavior passHref>
                    <SidebarMenuButton 
                        isActive={pathname === "/car-hire-dashboard/profile"}
                        tooltip={{ children: 'Profile' }}
                    >
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="https://picsum.photos/seed/car-hire/100/100" alt="Car Hire Service" />
                            <AvatarFallback>C</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-left">
                            <span className="font-semibold">Prestige Rentals</span>
                            <span className="text-xs text-muted-foreground">cars@eventide.app</span>
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
