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
  Calendar,
  Contact,
  Home,
  ImageIcon,
  LogOut,
  Palette,
  PartyPopper,
  Search,
  Sprout,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/events", icon: PartyPopper, label: "Events" },
  { href: "/calendar", icon: Calendar, label: "Calendar" },
  { href: "/guests", icon: Users, label: "Guests" },
  { href: "/invitations", icon: Bell, label: "Invitations" },
  { href: "/planners-cohosts", icon: Contact, label: "Planners & Cohosts" },
  { href: "/find-users", icon: Search, label: "Find Users" },
  { href: "/design-hub", icon: Palette, label: "Design Hub" },
  { href: "/media-library", icon: ImageIcon, label: "Media Library" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="flex items-center gap-2 font-headline font-bold text-lg">
                <span>EvenTide</span>
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
                    isActive={pathname.startsWith(item.href)}
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
                <SidebarMenuButton tooltip={{ children: 'Profile' }}>
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="https://picsum.photos/seed/avatar/100/100" alt="User" />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-left">
                        <span className="font-semibold">User Name</span>
                        <span className="text-xs text-muted-foreground">owner@eventide.app</span>
                    </div>
                </SidebarMenuButton>
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
