
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
} from "@/components/ui/sidebar";
import {
  Home,
  LogOut,
  User,
  Bell,
  Mail,
  Briefcase,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { DashboardHeader } from "@/components/layout/dashboard-header";

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
        </Sidebar>
        <div className="flex flex-1 flex-col overflow-hidden">
            <DashboardHeader />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                {children}
            </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
