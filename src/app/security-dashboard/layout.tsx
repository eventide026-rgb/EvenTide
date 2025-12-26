
'use client';

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";

export default function SecurityDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/security-login');
    }
  };


  return (
    <div className="flex min-h-screen flex-col bg-secondary">
       <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
            <div className="mr-4 flex">
                <Link href="/" className="mr-6 flex items-center space-x-2">
                    <Logo />
                    <span className="font-bold sm:inline-block">EvenTide Security</span>
                </Link>
            </div>
            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                <nav className="flex items-center">
                    <Button variant="ghost" onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Exit
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
