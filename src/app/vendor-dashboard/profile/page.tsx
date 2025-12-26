
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VendorProfileForm } from '@/components/forms/vendor-profile-form';

export default function VendorProfilePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl font-headline">My Public Profile</CardTitle>
        <CardDescription>This is your storefront. Fill it out completely to attract planners and event owners. Manage your bio, portfolio, and service packages here.</CardDescription>
      </CardHeader>
      <CardContent>
        <VendorProfileForm />
      </CardContent>
    </Card>
  );
}
