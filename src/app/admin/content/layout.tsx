
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
  LayoutDashboard,
  Home,
  LogOut,
  ChevronDown,
  Megaphone,
  MessageSquareQuote,
  DollarSign,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/layout/logo";
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/admin/content/dashboard", icon: LayoutDashboard, label: "Landing Page" },
  { href: "/admin/content/dropdowns", icon: ChevronDown, label: "Dropdown Menus" },
  { href: "/admin/content/ads", icon: Megaphone, label: "Advertisements" },
  { href: "/admin/content/testimonials", icon: MessageSquareQuote, label: "Testimonials" },
  { href: "/admin/content/pricing", icon: DollarSign, label: "Pricing Plans" },
];

export default function ContentAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const auth = useAuth();
  const router = useRouter();
  const { user } = useUser();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setUserName(sessionStorage.getItem('userName'));
    }
  }, [user]);

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  const isNavItemActive = (href: string) => {
    if (href === "/admin/content/dashboard") {
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
                          <AvatarImage src="https://picsum.photos/seed/content-admin/100/100" alt="Content Admin" />
                          <AvatarFallback>CA</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col text-left">
                          <span className="font-semibold">{userName || 'Content Admin'}</span>
                          <span className="text-xs text-muted-foreground">content.admin@eventide.app</span>
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
