
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GuestProfileForm } from '@/components/forms/guest-profile-form';

export default function GuestProfilePage() {
  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
        <CardDescription>Manage your name and other details for this event. Your changes will be visible to the host.</CardDescription>
      </CardHeader>
      <CardContent>
          <GuestProfileForm />
      </CardContent>
    </Card>
  );
}
