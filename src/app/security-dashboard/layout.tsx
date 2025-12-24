
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";

export default function SecurityDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-secondary">
       <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
            <div className="mr-4 hidden md:flex">
                <Link href="/security-dashboard" className="mr-6 flex items-center space-x-2">
                    <Logo />
                </Link>
            </div>
            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                <nav className="flex items-center">
                    <Button asChild variant="ghost">
                        <Link href="/security-login">
                            <LogOut className="mr-2 h-4 w-4" />
                            Exit
                        </Link>
                    </Button>
                </nav>
            </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center py-12 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
