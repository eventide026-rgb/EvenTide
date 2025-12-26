
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
  Home,
  LogOut,
  PartyPopper,
  Ticket,
  User,
  Bell,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/layout/logo";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { NotificationBell } from "@/components/layout/notification-bell";

const navItems = [
  { href: "/ticketier-dashboard", icon: Home, label: "Dashboard" },
  { href: "/ticketier-dashboard/shows", icon: PartyPopper, label: "My Shows" },
  { href: "/ticketier-dashboard/profile", icon: User, label: "My Profile" },
];

export default function TicketierDashboardLayout({ children }: { children: React.ReactNode }) {
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
    if (href === "/ticketier-dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

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
                <Link href="/ticketier-dashboard/profile" legacyBehavior passHref>
                    <SidebarMenuButton 
                        isActive={pathname === "/ticketier-dashboard/profile"}
                        tooltip={{ children: 'Profile' }}
                    >
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="https://picsum.photos/seed/ticketier/100/100" alt="Ticketier" />
                            <AvatarFallback>T</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-left">
                            <span className="font-semibold">Vibes on Vibes</span>
                            <span className="text-xs text-muted-foreground">promoter@eventide.app</span>
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
