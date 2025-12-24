
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function MyCarsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">My Cars</h1>
          <p className="text-muted-foreground">Manage your vehicle listings.</p>
        </div>
        <Button asChild>
          <Link href="/car-hire-dashboard/my-cars/new">Add New Car</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Fleet</CardTitle>
          <CardDescription>All vehicles you have listed for hire on EvenTide.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="text-center py-16 border-dashed border-2 rounded-lg">
              <h3 className="text-xl font-semibold">You haven't listed any cars yet.</h3>
              <p className="text-muted-foreground mt-2 mb-4">Click the button below to add your first vehicle.</p>
              <Button asChild>
                <Link href="/car-hire-dashboard/my-cars/new">Add New Car</Link>
              </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
