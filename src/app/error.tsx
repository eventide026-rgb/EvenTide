'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

/**
 * @fileOverview Standard segment Error Boundary.
 * Catches errors in the main application flow.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error('App Segment Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] w-full items-center justify-center p-4">
      <Card className="max-w-md w-full border-destructive/50 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-4">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="font-headline">Something went wrong</CardTitle>
          <CardDescription>
            An error occurred while loading this section of the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="bg-muted p-3 rounded-md text-[10px] font-mono overflow-auto max-h-32">
            {error.message || 'Unknown application error'}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => window.location.href = '/'}>
              Home
            </Button>
            <Button className="flex-1 font-bold" onClick={() => reset()}>
              Try again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
