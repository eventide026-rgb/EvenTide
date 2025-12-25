
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
      <SidebarInset>
        <main className="min-h-svh bg-background p-4 sm:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
