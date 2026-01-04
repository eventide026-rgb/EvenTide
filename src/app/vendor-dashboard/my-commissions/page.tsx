
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function MyCommissionsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Commissions</CardTitle>
        <CardDescription>Manage your bespoke design projects and client consultations.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground py-16">Your commission requests and active projects will appear here.</p>
      </CardContent>
    </Card>
  );
}
