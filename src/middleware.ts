
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for Role-Based Access Control (RBAC).
 * Intercepts requests to dashboard routes and validates the 'userRole' cookie.
 */

// Define mapping of dashboard path prefixes to required roles or groups
const ROLE_PATH_MAP: Record<string, string[]> = {
  '/owner': ['Owner'],
  '/planner': ['Planner'],
  '/vendor': ['Vendor', 'MC/Host', 'Caterer', 'DJ/Musician', 'Fashion Designer', 'Photographer', 'Videographer', 'Decorator'],
  '/ticketier': ['Ticketier'],
  '/cohost': ['Co-host'],
  '/security': ['Security'],
  '/hall-owner': ['Hall Owner'],
  '/hotelier': ['Hotelier'],
  '/car-hire': ['Car Hire Service'],
  '/admin': ['Super Admin', 'User Admin', 'Content Admin', 'Editorial Admin'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userRole = request.cookies.get('userRole')?.value;

  // 1. Identify if the current path is a protected dashboard route
  const matchingPrefix = Object.keys(ROLE_PATH_MAP).find(prefix => 
    pathname.startsWith(prefix)
  );

  if (matchingPrefix) {
    // 2. If no role cookie exists, user is not authenticated or role is not resolved.
    // Redirect to login.
    if (!userRole) {
      const loginUrl = new URL('/login', request.url);
      // Append redirect param to return after login
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 3. Verify the role matches the required roles for this path prefix.
    const allowedRoles = ROLE_PATH_MAP[matchingPrefix];
    const isAllowed = allowedRoles.includes(userRole);

    if (!isAllowed) {
      // Role mismatch detected. 
      // In a real app, we might redirect them to their specific dashboard based on their actual role.
      // For now, we redirect to the root or a generic unauthorized page.
      console.warn(`Middleware: Access denied for role '${userRole}' to path '${pathname}'`);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// Optimized matcher to run middleware only on dashboard and admin routes
export const config = {
  matcher: [
    '/owner/:path*',
    '/planner/:path*',
    '/vendor/:path*',
    '/ticketier/:path*',
    '/cohost/:path*',
    '/security/:path*',
    '/hall-owner/:path*',
    '/hotelier/:path*',
    '/car-hire/:path*',
    '/admin/:path*',
  ],
};
