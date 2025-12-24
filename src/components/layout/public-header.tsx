'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Sprout } from 'lucide-react';
import { usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navLinks: { label: string, href: string }[] = [];

export function PublicHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-4 z-50 w-full">
      <div className="container flex h-16 max-w-screen-lg items-center rounded-full border border-border/40 bg-background/60 p-2 shadow-lg backdrop-blur-lg">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Sprout className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline text-lg">EvenTide</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">Resources</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href="#">What is EvenTide</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="#">How to Use EvenTide</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="#">Meet Eni</Link>
              </DropdownMenuItem>
               <DropdownMenuItem asChild>
                <Link href="/about">About Us</Link>
              </DropdownMenuItem>
                <DropdownMenuItem asChild>
                <Link href="#testimonials">Testimonials</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">Community</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href="/guest-login">Guest Login</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/security-login">Security Login</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="#">Find Planners</Link>
              </DropdownMenuItem>
               <DropdownMenuItem asChild>
                <Link href="#">Find Vendors</Link>
              </DropdownMenuItem>
                <DropdownMenuItem asChild>
                <Link href="#">Advertise</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">Magazine</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href="#">View All Issues</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="#">From the Editor</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
                 <Link href="#" className="text-muted-foreground hover:text-foreground">Resources</Link>
                 <Link href="#" className="text-muted-foreground hover:text-foreground">Community</Link>
                 <Link href="#" className="text-muted-foreground hover:text-foreground">Magazine</Link>
                {navLinks.map(link => (
                    <Link key={link.label} href={link.label} className="text-muted-foreground hover:text-foreground">{link.label}</Link>
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
