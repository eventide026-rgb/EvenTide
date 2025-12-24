
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export default function GuestCardsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">My Cards</h1>
        <p className="text-muted-foreground">Your digital wallet for this event. Some cards unlock after check-in.</p>
      </div>

       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card>
            <CardHeader>
                <CardTitle>Invitation Card</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-center py-16">Invitation Card Preview</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Digital Gate Pass</CardTitle>
            </CardHeader>
            <CardContent>
                 <p className="text-muted-foreground text-center py-16">Gate Pass with QR Code</p>
            </CardContent>
        </Card>
         <Card className="relative border-dashed">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <Lock className="h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground font-semibold">Locked</p>
                <p className="text-xs text-muted-foreground">Unlocks upon check-in</p>
            </div>
            <CardHeader>
                <CardTitle className="text-muted-foreground">Menu Card</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="h-48" />
            </CardContent>
        </Card>
        <Card className="relative border-dashed">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <Lock className="h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground font-semibold">Locked</p>
                <p className="text-xs text-muted-foreground">Unlocks upon check-in</p>
            </div>
            <CardHeader>
                <CardTitle className="text-muted-foreground">Program Card</CardTitle>
            </CardHeader>
             <CardContent>
                 <div className="h-48" />
            </CardContent>
        </Card>
       </div>
    </div>
  );
}
