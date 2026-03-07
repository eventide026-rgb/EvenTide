
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ChevronDown, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Logo } from './logo';

const resourceLinks = [
    { href: "/resources/what-is-eventide", label: "What is EvenTide" },
    { href: "/resources/how-to-use", label: "How to Use EvenTide" },
    { href: "/resources/meet-eni", label: "Meet Eni" },
    { href: "/about", label: "About Us" },
    { href: "/resources/submit-testimonial", label: "Submit a Testimonial" },
];

const communityLinks = [
    { href: "/guest-login", label: "Guest Login" },
    { href: "/security-login", label: "Security Login" },
    { href: "/resources/planners", label: "Find Planners" },
];

const magazineLinks = [
    { href: "/resources/magazine", label: "View All Issues" },
    { href: "/resources/editorial", label: "From the Editor" },
]

const marketplaceLinks = [
    { href: "/shows", label: "Buy Tickets" },
    { href: "/resources/hotels", label: "Find a Hotel" },
    { href: "/resources/venues", label: "Find a Venue" },
    { href: "/resources/cars", label: "Find a Car" },
]

const getImage = (id: string) => {
  return PlaceHolderImages.find((img) => img.id === id);
};

const HeaderContent = () => {
  const resourceImage = getImage('eventHall');
  const communityImage = getImage('africansFun1');
  const magazineImage = getImage('magazineReader');
  const hotelsImage = getImage('venueHall');

  return (
    <div className="container flex h-12 items-center px-4">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <Logo />
      </Link>
      <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="h-8 rounded-full px-3">
              Resources <ChevronDown className="ml-1 h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2 shadow-xl border-border/40">
              {resourceImage && (
              <div className="relative h-24 w-full mb-2 rounded-md overflow-hidden">
                <Image 
                    src={resourceImage.imageUrl}
                    alt={resourceImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={resourceImage.imageHint}
                />
              </div>
            )}
            <div className="grid gap-1">
              {resourceLinks.map(link => (
                <Link 
                  key={link.label}
                  href={link.href}
                  className="rounded-md p-2 text-sm hover:bg-accent transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="h-8 rounded-full px-3">Community <ChevronDown className="ml-1 h-3.5 w-3.5" /></Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2 shadow-xl border-border/40">
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
                className="rounded-md p-2 text-sm hover:bg-accent transition-colors"
              >
                {link.label}
              </Link>
            ))}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="h-8 rounded-full px-3">Magazine <ChevronDown className="ml-1 h-3.5 w-3.5" /></Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2 shadow-xl border-border/40">
            {magazineImage && (
              <div className="relative h-24 w-full mb-2 rounded-md overflow-hidden">
                <Image
                  src={magazineImage.imageUrl}
                  alt={magazineImage.description}
                  fill
                  className="object-cover"
                  data-ai-hint={magazineImage.imageHint}
                />
              </div>
            )}
            <div className="grid gap-1">
              {magazineLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-md p-2 text-sm hover:bg-accent transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="h-8 rounded-full px-3">Marketplace <ChevronDown className="ml-1 h-3.5 w-3.5" /></Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2 shadow-xl border-border/40">
            {hotelsImage && (
              <div className="relative h-24 w-full mb-2 rounded-md overflow-hidden">
                <Image
                  src={hotelsImage.imageUrl}
                  alt={hotelsImage.description}
                  fill
                  className="object-cover"
                  data-ai-hint={hotelsImage.imageHint}
                />
              </div>
            )}
            <div className="grid gap-1">
              {marketplaceLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-md p-2 text-sm hover:bg-accent transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </nav>
      <div className="flex flex-1 items-center justify-end space-x-2">
        <div className="hidden md:flex items-center space-x-1 rounded-full border bg-background/80 p-1">
          <Button variant="ghost" asChild className="rounded-full h-8 px-4 text-xs font-semibold">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="rounded-full h-8 px-4 text-xs font-semibold">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
        <div className="md:hidden">
            <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
                <Menu className="h-4 w-4" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
                <nav className="grid gap-6 text-lg font-medium pt-8">
                <Link href="/" className="flex items-center space-x-2">
                    <Logo />
                </Link>
                <div className="space-y-4">
                    <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Resources</p>
                    {resourceLinks.map(l => <Link key={l.label} href={l.href} className="block text-sm py-1">{l.label}</Link>)}
                </div>
                <div className="flex flex-col space-y-4 pt-6">
                    <Button asChild className="w-full">
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/signup">Sign Up</Link>
                    </Button>
                </div>
                </nav>
            </SheetContent>
            </Sheet>
        </div>
      </div>
    </div>
  );
};

export function PublicHeader() {
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY < 20);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  return (
    <header className={cn(
        "fixed left-0 right-0 z-50 w-full transition-all duration-500 ease-in-out px-4",
        isAtTop ? "top-6" : "top-0 px-0"
    )}>
       <div
        className={cn(
          "container rounded-full border border-border/40 bg-background/60 p-1 shadow-lg backdrop-blur-xl transition-all duration-500 ease-in-out mx-auto",
          isAtTop ? "max-w-screen-lg" : "max-w-none rounded-none border-x-0 border-t-0"
        )}
      >
        <HeaderContent />
      </div>
    </header>
  );
}
