'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Sprout } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#gallery', label: 'Gallery' },
  { href: '/pricing', label: 'Pricing' },
];

export function PublicHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Sprout className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline text-lg">EvenTide</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map(link => (
             <Link key={link.label} href={link.href} className="transition-colors hover:text-foreground/80 text-foreground/60">{link.label}</Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button variant="ghost" asChild>
            <Link href="/guest-login">Guest Login</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/security-login">Security Login</Link>
          </Button>
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </div>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="grid gap-6 text-lg font-medium">
                <Link href="/" className="flex items-center space-x-2">
                    <Sprout className="h-6 w-6 text-primary" />
                    <span className="font-bold font-headline text-lg">EvenTide</span>
                </Link>
                {navLinks.map(link => (
                    <Link key={link.label} href={link.href} className="text-muted-foreground hover:text-foreground">{link.label}</Link>
                ))}
                <div className="flex flex-col space-y-2 pt-6">
                    <Button variant="outline" asChild>
                        <Link href="/guest-login">Guest Login</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/security-login">Security Login</Link>
                    </Button>
                     <Button asChild>
                        <Link href="/login">Owner / Planner Login</Link>
                    </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
