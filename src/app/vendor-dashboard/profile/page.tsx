
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function VendorProfilePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl font-headline">My Public Profile</CardTitle>
        <CardDescription>This is your storefront. Fill it out completely to attract planners and event owners.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground py-16">The Vendor Profile Form will be implemented here.</p>
      </CardContent>
    </Card>
  );
}
