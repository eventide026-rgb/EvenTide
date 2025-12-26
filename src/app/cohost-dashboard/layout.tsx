
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
  User,
  Bell,
  Mail,
  Briefcase,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/layout/logo";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { NotificationBell } from "@/components/layout/notification-bell";

const navItems = [
  { href: "/cohost-dashboard", icon: Home, label: "Dashboard" },
  { href: "/cohost-dashboard/my-gigs", icon: Briefcase, label: "My Gigs" },
  { href: "/cohost-dashboard/invitations", icon: Mail, label: "Invitations" },
];

export default function CoHostDashboardLayout({ children }: { children: React.ReactNode }) {
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
    if (href === "/cohost-dashboard") {
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
                <Link href="/cohost-dashboard/profile" legacyBehavior passHref>
                    <SidebarMenuButton 
                        isActive={pathname === "/cohost-dashboard/profile"}
                        tooltip={{ children: 'Profile' }}
                    >
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="https://picsum.photos/seed/cohost/100/100" alt="Co-host" />
                            <AvatarFallback>C</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-left">
                            <span className="font-semibold">Co-host</span>
                            <span className="text-xs text-muted-foreground">cohost@eventide.app</span>
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
