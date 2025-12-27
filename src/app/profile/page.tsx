'use client';

import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, Mail } from 'lucide-react';

export default function ProfilePage() {
  const { user, isUserLoading, userError } = useUser();

  // Hard guard: auth not ready yet
  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Auth failed
  if (userError) {
    return (
      <div className="text-center text-destructive">
        Authentication error: {userError.message}
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div className="text-center text-muted-foreground">
        You must be signed in to view this page.
      </div>
    );
  }

  // Auth confirmed
  return (
    <div className="max-w-xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Account Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            This email is retrieved directly from Firebase Authentication.
          </p>
          <p className="text-lg font-semibold">
            {user.email ?? 'No email associated with this account'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
