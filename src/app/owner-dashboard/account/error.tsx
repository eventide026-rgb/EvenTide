'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
     <Card className="max-w-2xl mx-auto border-destructive">
      <CardHeader className="items-center text-center">
        <AlertTriangle className="h-10 w-10 text-destructive mb-2" />
        <CardTitle className="text-destructive">Something went wrong!</CardTitle>
        <CardDescription>
            An unexpected error occurred while loading your account details.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground mb-4">You can try to reload the page or contact support if the problem persists.</p>
        <Button onClick={() => reset()}>
          Try again
        </Button>
      </CardContent>
    </Card>
  )
}