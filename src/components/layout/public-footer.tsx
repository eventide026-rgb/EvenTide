
import { Twitter, Github, Linkedin } from 'lucide-react';
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
        { href: "/resources/what-is-eventide", label: "What is EvenTide" },
        { href: "/resources/how-to-use", label: "How to Use EvenTide" },
        { href: "/resources/meet-eni", label: "Meet Eni" },
        { href: "/about", label: "About Us" },
    ],
    community: [
        { href: "/guest-login", label: "Guest Login" },
        { href: "/security-login", label: "Security Login" },
        { href: "#", label: "Find Planners" },
        { href: "#", "label": "Find Vendors" },
        { href: "/resources/submit-testimonial", label: "Submit a Testimonial" },
        { href: "/advertise", label: "Advertise" },
    ],
    magazine: [
        { href: "/resources/magazine", label: "View All Issues" },
        { href: "/resources/editorial", label: "From the Editor" },
    ],
    hotelsAndVenues: [
        { href: "/resources/hotels", label: "Find a Hotel" },
        { href: "/resources/venues", label: "Find a Venue" },
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
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-4 flex flex-col text-center lg:text-left items-center lg:items-start">
                 <div className="flex items-center space-x-2 mb-4">
                    <span className="font-bold text-xl font-headline">EvenTide</span>
                </div>
                <p className="text-muted-foreground text-sm max-w-xs">
                    AI-powered event management for unforgettable moments.
                </p>
            </div>
            <div className="lg:col-span-8 w-full grid grid-cols-2 md:grid-cols-5 gap-8 text-left">
                <FooterLinkColumn title="Resources" links={footerLinks.resources} />
                <FooterLinkColumn title="Community" links={footerLinks.community} />
                <FooterLinkColumn title="Magazine" links={footerLinks.magazine} />
                <FooterLinkColumn title="Hotels & Venues" links={footerLinks.hotelsAndVenues} />
                <FooterLinkColumn title="Legal" links={footerLinks.legal} />
            </div>
        </div>

        <div className="mt-12 border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
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
          </div>
        </div>
      </div>
    </footer>
  );
}
    