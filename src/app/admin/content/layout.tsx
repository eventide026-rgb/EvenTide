
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

const navItems = [
  { href: "/admin/content/dashboard", icon: LayoutDashboard, label: "Landing Page" },
  { href: "/admin/content/dropdowns", icon: ChevronDown, label: "Dropdown Menus" },
  { href: "/admin/content/ads", icon: Megaphone, label: "Advertisements" },
  { href: "/admin/content/testimonials", icon: MessageSquareQuote, label: "Testimonials" },
  { href: "/admin/content/pricing", icon: DollarSign, label: "Pricing Plans" },
];

export default function ContentAdminLayout({ children }: { children: React.ReactNode }) {
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
                        <AvatarImage src="https://picsum.photos/seed/content-admin/100/100" alt="Content Admin" />
                        <AvatarFallback>CA</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-left">
                        <span className="font-semibold">Content Admin</span>
                        <span className="text-xs text-muted-foreground">content.admin@eventide.app</span>
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
