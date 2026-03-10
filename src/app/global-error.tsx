'use client';

import { Button } from '@/components/ui/button';

/**
 * @fileOverview Root Error Boundary for Next.js 15.
 * Handles critical application-wide crashes.
 * Resolves manifest issues where Next.js cannot find its built-in global-error module.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="font-body antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
          <div className="mx-auto bg-destructive/10 p-4 rounded-full w-fit mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-destructive h-8 w-8"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold font-headline mb-2">A critical error occurred</h2>
          <p className="text-muted-foreground mb-8 max-w-md text-sm">
            EvenTide encountered an unexpected issue. We've been notified and are working on it.
            {error.digest && <span className="block mt-2 font-mono text-[10px]">Error ID: {error.digest}</span>}
          </p>
          <div className="flex gap-4">
            <Button onClick={() => window.location.reload()} variant="outline">
              Reload Page
            </Button>
            <Button onClick={() => reset()} className="font-bold shadow-lg">
              Try again
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
