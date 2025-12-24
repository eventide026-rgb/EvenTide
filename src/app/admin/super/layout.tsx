
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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Shield,
  Home,
  LogOut,
  Users,
  Briefcase,
  LifeBuoy,
  LayoutDashboard,
  ChevronDown,
  Megaphone,
  MessageSquareQuote,
  DollarSign,
  BookOpen,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/layout/logo";

const superAdminNav = [
  { href: "/admin/super/dashboard", icon: Home, label: "Dashboard" },
  { href: "/admin/super/office", icon: Briefcase, label: "The Office" },
];

const userAdminNav = [
    { href: "/admin/user/users", icon: Users, label: "User Management" },
    { href: "/admin/user/support-tickets", icon: LifeBuoy, label: "Support Tickets" },
]

const contentAdminNav = [
  { href: "/admin/content/dashboard", icon: LayoutDashboard, label: "Landing Page" },
  { href: "/admin/content/dropdowns", icon: ChevronDown, label: "Dropdown Menus" },
  { href: "/admin/content/ads", icon: Megaphone, label: "Advertisements" },
  { href: "/admin/content/testimonials", icon: MessageSquareQuote, label: "Testimonials" },
  { href: "/admin/content/pricing", icon: DollarSign, label: "Pricing Plans" },
];

const editorialAdminNav = [
    { href: "/admin/editorial/magazine", icon: BookOpen, label: "Magazine Curation" },
]

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const allNavItems = [
      ...superAdminNav,
      ...userAdminNav,
      ...contentAdminNav,
      ...editorialAdminNav
  ]

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Link href="/admin/super/dashboard" className="flex items-center gap-2 font-headline font-bold text-lg">
                <Logo />
            </Link>
            <SidebarTrigger className="ml-auto" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {superAdminNav.map((item) => (
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
             <SidebarSeparator />
             {userAdminNav.map((item) => (
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
            <SidebarSeparator />
             {contentAdminNav.map((item) => (
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
             <SidebarSeparator />
             {editorialAdminNav.map((item) => (
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
                        <AvatarImage src="https://picsum.photos/seed/super-admin/100/100" alt="Super Admin" />
                        <AvatarFallback>SA</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-left">
                        <span className="font-semibold">Super Admin</span>
                        <span className="text-xs text-muted-foreground">super@eventide.app</span>
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
