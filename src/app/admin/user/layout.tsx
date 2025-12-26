
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
  LifeBuoy,
  Home,
  LogOut,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/layout/logo";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";

const navItems = [
  { href: "/admin/user/dashboard", icon: Home, label: "Dashboard" },
  { href: "/admin/user/users", icon: Users, label: "User Management" },
  { href: "/admin/user/support-tickets", icon: LifeBuoy, label: "Support Tickets" },
];

export default function UserAdminLayout({ children }: { children: React.ReactNode }) {
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
    if (href === "/admin/user/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full flex-row bg-muted/40 overflow-hidden">
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
                  <SidebarMenuButton tooltip={{ children: 'Profile' }}>
                      <Avatar className="h-8 w-8">
                          <AvatarImage src="https://picsum.photos/seed/user-admin/100/100" alt="User Admin" />
                          <AvatarFallback>UA</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col text-left">
                          <span className="font-semibold">User Admin</span>
                          <span className="text-xs text-muted-foreground">user.admin@eventide.app</span>
                      </div>
                  </SidebarMenuButton>
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
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                {children}
            </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
