
'use client';

import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PlannerProfileForm } from '@/components/forms/planner-profile-form';

export default function ProfilePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Public Profile</CardTitle>
        <CardDescription>This is your storefront on EvenTide. Complete your profile to help event owners find and vet you for their next event.</CardDescription>
      </CardHeader>
      <CardContent>
        <PlannerProfileForm />
      </CardContent>
    </Card>
  );
}
