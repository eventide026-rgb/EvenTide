
'use client';

import {
  Briefcase,
  Calendar,
  CheckSquare,
  Contact,
  CreditCard,
  Gift,
  Home,
  LayoutDashboard,
  MessageCircle,
  Music,
  Palette,
  PartyPopper,
  Percent,
  Search,
  Settings,
  Users,
  Bell,
  LogOut,
  ClipboardList,
  ShieldCheck,
  FileText,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/layout/logo';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuItem,
  SidebarMenu,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { OwnerDashboardSidebar } from '@/components/layout/owner-sidebar';

export default function OwnerDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full flex-row bg-muted/40">
      <SidebarProvider>
        <OwnerDashboardSidebar />
        <div className="flex flex-col flex-1 h-full">
            <DashboardHeader />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {children}
            </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
