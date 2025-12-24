
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
import { Logo } from "@/components/layout/logo";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Redirect from the generic app layout to the specific owner dashboard
    router.replace('/owner-dashboard');
  }, [router]);

  return (
    <div className="flex h-full min-h-screen w-full items-center justify-center">
      <p>Redirecting...</p>
    </div>
  );
}
