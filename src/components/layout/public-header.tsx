
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ChevronDown, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const navLinks: { label: string, href: string }[] = [];

const resourceLinks = [
    { href: "#", label: "What is EvenTide" },
    { href: "#", label: "How to Use EvenTide" },
    { href: "#", label: "Meet Eni" },
    { href: "/about", label: "About Us" },
    { href: "#testimonials", label: "Testimonials" },
];

const communityLinks = [
    { href: "/guest-login", label: "Guest Login" },
    { href: "/security-login", label: "Security Login" },
    { href: "#", label: "Find Planners" },
    { href: "#", label: "Find Vendors" },
    { href: "#", label: "Advertise" },
];

const getImage = (id: string) => {
  return PlaceHolderImages.find((img) => img.id === id);
};

const HeaderContent = () => {
  const resourceImage = getImage('eventHall'); // Placeholder, will be updated if a better one is added
  const communityImage = getImage('gardenParty');

  return (
    <div className="container flex h-16 max-w-screen-lg items-center rounded-full border border-border/40 bg-background/60 p-2 shadow-lg backdrop-blur-lg">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <span className="font-logo font-bold text-lg bg-gradient-to-r from-blue-400 to-yellow-300 text-transparent bg-clip-text">EvenTide</span>
      </Link>
      <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost">
              Resources <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2">
            
              <div className="relative h-24 w-full mb-2 rounded-md overflow-hidden">
                <Image 
                    src="https://picsum.photos/seed/desk/600/400"
                    alt="A person learning at a desk"
                    fill
                    className="object-cover"
                />
              </div>
            
            <div className="grid gap-1">
              {resourceLinks.map(link => (
                <Link 
                  key={link.label}
                  href={link.href}
                  className="rounded-md p-2 text-sm hover:bg-accent"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost">Community <ChevronDown className="ml-1 h-4 w-4" /></Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2">
             {communityImage && (
              <div className="relative h-24 w-full mb-2 rounded-md overflow-hidden">
                <Image
                  src={communityImage.imageUrl}
                  alt={communityImage.description}
                  fill
                  className="object-cover"
                  data-ai-hint={communityImage.imageHint}
                />
              </div>
            )}
            <div className="grid gap-1">
            {communityLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-md p-2 text-sm hover:bg-accent"
              >
                {link.label}
              </Link>
            ))}
            </div>
          </PopoverContent>
        </Popover>

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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">Hotel & Halls</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link href="#">Find a Hotel</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="#">Find a Venue</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {navLinks.map(link => (
          <Link key={link.label} href={link.href} className="transition-colors hover:text-foreground/80 text-foreground/60">{link.label}</Link>
        ))}
      </nav>
      <div className="flex flex-1 items-center justify-end">
        <div className="hidden md:flex items-center space-x-1 rounded-full border bg-background/80 p-1">
          <Button variant="ghost" asChild className="rounded-full">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="rounded-full">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
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
                  <span className="font-logo font-bold text-lg bg-gradient-to-r from-blue-400 to-yellow-300 text-transparent bg-clip-text">EvenTide</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">Resources</Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">Community</Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">Magazine</Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">Hotel & Halls</Link>
              {navLinks.map(link => (
                  <Link key={link.label} href={link.label} className="text-muted-foreground hover:text-foreground">{link.label}</Link>
              ))}
              <div className="flex flex-col space-y-2 pt-6">
                   <Button asChild>
                      <Link href="/login">Owner / Planner Login</Link>
                  </Button>
                   <Button asChild>
                      <Link href="/guest-login">Guest Login</Link>
                  </Button>
                   <Button asChild>
                      <Link href="/security-login">Security Login</Link>
                  </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export function PublicHeader() {
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY === 0);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  return (
    <header className="sticky top-4 z-50 w-full">
      <div className="relative">
        <div
          className={cn(
            'absolute bottom-full left-0 right-0 mb-2 transition-opacity duration-300',
            isAtTop ? 'opacity-100' : 'opacity-0'
          )}
          aria-hidden="true"
        >
          <div className="scale-y-[-1] opacity-50 blur-sm">
            <HeaderContent />
          </div>
        </div>
        <HeaderContent />
      </div>
    </header>
  );
}
