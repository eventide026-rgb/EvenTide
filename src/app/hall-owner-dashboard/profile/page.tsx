
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
        <CardDescription>Manage your public-facing venue provider profile.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Your profile editing form will appear here.</p>
      </CardContent>
    </Card>
  );
}
