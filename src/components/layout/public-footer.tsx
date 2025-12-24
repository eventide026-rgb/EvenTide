import { Sprout, Twitter, Github, Linkedin, Instagram } from 'lucide-react';
import Link from 'next/link';

function SocialIcon({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-muted-foreground hover:text-primary">
      {children}
    </Link>
  );
}

const footerLinks = {
    resources: [
        { href: "#", label: "What is EvenTide" },
        { href: "#", label: "How to Use EvenTide" },
        { href: "#", label: "Meet Eni" },
        { href: "/about", label: "About Us" },
        { href: "#testimonials", label: "Testimonials" },
    ],
    community: [
        { href: "/guest-login", label: "Guest Login" },
        { href: "/security-login", label: "Security Login" },
        { href: "#", label: "Find Planners" },
        { href: "#", "label": "Find Vendors" },
        { href: "#", label: "Advertise" },
    ],
    magazine: [
        { href: "#", label: "View All Issues" },
        { href: "#", label: "From the Editor" },
    ],
    hotelsAndVenues: [
        { href: "#", label: "Find a Hotel" },
        { href: "#", label: "Find a Venue" },
    ],
    legal: [
        { href: "#", label: "Privacy Policy" },
        { href: "#", label: "Terms of Service" },
        { href: "/contact", label: "Contact Us" },
    ]
}

function FooterLinkColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
    return (
        <div>
            <h3 className="font-headline font-bold mb-4">{title}</h3>
            <ul className="space-y-3">
                {links.map(link => (
                    <li key={link.label}>
                        <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export function PublicFooter() {
  return (
    <footer className="bg-secondary/50 border-t">
      <div className="container mx-auto px-4 py-12 md:py-16 text-center">
        <div className="flex flex-col items-center gap-8 lg:gap-12">
            <div className="flex flex-col items-center text-center">
                 <div className="flex items-center space-x-2 mb-4">
                    <Sprout className="h-8 w-8 text-primary" />
                    <span className="font-bold text-xl font-headline">EvenTide</span>
                </div>
                <p className="text-muted-foreground text-sm max-w-xs">
                    AI-powered event management for unforgettable moments.
                </p>
            </div>
            <div className="w-full grid grid-cols-2 md:grid-cols-5 gap-8 text-left">
                <FooterLinkColumn title="Resources" links={footerLinks.resources} />
                <FooterLinkColumn title="Community" links={footerLinks.community} />
                <FooterLinkColumn title="Magazine" links={footerLinks.magazine} />
                <FooterLinkColumn title="Hotels & Venues" links={footerLinks.hotelsAndVenues} />
                <FooterLinkColumn title="Legal" links={footerLinks.legal} />
            </div>
        </div>

        <div className="mt-12 border-t pt-8 flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} EvenTide. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <SocialIcon href="#">
                <Twitter className="size-5" />
            </SocialIcon>
             <SocialIcon href="#">
                <Github className="size-5" />
            </SocialIcon>
            <SocialIcon href="#">
                <Linkedin className="size-5" />
            </SocialIcon>
             <SocialIcon href="#">
                <Instagram className="size-5" />
            </SocialIcon>
          </div>
        </div>
      </div>
    </footer>
  );
}
