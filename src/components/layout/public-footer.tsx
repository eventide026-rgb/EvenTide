import { Sprout } from 'lucide-react';
import Link from 'next/link';

function SocialIcon({ children }: { children: React.ReactNode }) {
  return (
    <Link href="#" className="text-muted-foreground hover:text-primary">
      {children}
    </Link>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Sprout className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl font-headline">EvenTide</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-4 md:gap-6 mb-4 md:mb-0 text-sm text-muted-foreground">
            <Link href="#features" className="hover:text-primary">Features</Link>
            <Link href="/pricing" className="hover:text-primary">Pricing</Link>
            <Link href="#" className="hover:text-primary">About</Link>
            <Link href="#" className="hover:text-primary">Contact</Link>
            <Link href="#" className="hover:text-primary">Terms of Service</Link>
            <Link href="#" className="hover:text-primary">Privacy Policy</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <SocialIcon>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
            </SocialIcon>
            <SocialIcon>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
            </SocialIcon>
            <SocialIcon>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.013-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.345 2.525c.636-.247 1.363-.416 2.427-.465C9.793 2.013 10.147 2 12.315 2zm0 1.623c-2.387 0-2.691.01-3.633.053-1.002.045-1.504.207-1.857.344-.467.182-.86.399-1.254.793a3.28 3.28 0 00-.793 1.254c-.137.353-.3.855-.344 1.857-.043.942-.053 1.246-.053 3.633s.01 2.691.053 3.633c.045 1.002.207 1.504.344 1.857.182.466.399.86.793 1.254a3.28 3.28 0 001.254.793c.353.137.855.3 1.857.344.942.043 1.246.053 3.633.053s2.691-.01 3.633-.053c1.002-.045 1.504-.207 1.857-.344.467-.182.86-.399 1.254-.793a3.28 3.28 0 00.793-1.254c.137-.353.3-.855.344-1.857.043-.942.053-1.246.053-3.633s-.01-2.691-.053-3.633c-.045-1.002-.207-1.504-.344-1.857a3.28 3.28 0 00-.793-1.254 3.28 3.28 0 00-1.254-.793c-.353-.137-.855-.3-1.857-.344-.942-.043-1.246-.053-3.633-.053zm0 7.72a4.105 4.105 0 100-8.21 4.105 4.105 0 000 8.21zm0-6.586a2.48 2.48 0 110 4.96 2.48 2.48 0 010-4.96zM18.235 5.25a1.385 1.385 0 100 2.77 1.385 1.385 0 000-2.77z" clipRule="evenodd" /></svg>
            </SocialIcon>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} EvenTide. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
