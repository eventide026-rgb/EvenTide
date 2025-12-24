
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, DollarSign, Users, Ticket, Link as LinkIcon, Copy } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function TicketierDashboardPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const ticketierRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'ticketiers', user.uid);
    }, [firestore, user]);

    const { data: ticketierProfile, isLoading } = useDoc(ticketierRef);

    const publicProfileUrl = user ? `${window.location.origin}/t/${user.uid}` : '';

    const copyToClipboard = () => {
        navigator.clipboard.writeText(publicProfileUrl);
        toast({
            title: "Copied to Clipboard",
            description: "Your public profile URL has been copied.",
        });
    };

  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline">Promoter Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's an overview of your events.</p>
          </div>
          <Button asChild>
            <Link href="/events/new">Create New Event</Link>
          </Button>
       </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦1,250,000.00</div>
            <p className="text-xs text-muted-foreground">
              +30.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+1,234</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <PartyPopper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+5</div>
            <p className="text-xs text-muted-foreground">
              +1 since last week
            </p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Public Profile</CardTitle>
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <>
                        <Skeleton className="h-5 w-full mb-2" />
                        <Skeleton className="h-9 w-full" />
                    </>
                ) : (
                    <>
                        <p className="text-xs text-muted-foreground truncate">Your public promoter page</p>
                        <Button onClick={copyToClipboard} variant="outline" size="sm" className="w-full mt-2">
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Link
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>
              Your next few events at a glance.
            </CardDescription>
          </div>
          <Button asChild size="sm" className="ml-auto gap-1">
            <Link href="/ticketier-dashboard/events">
              View All
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="text-right">Tickets Sold</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Beachside Bonfire</div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge className="text-xs" variant="outline">
                    Upcoming
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  2024-11-20
                </TableCell>
                <TableCell className="text-right">150/200</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Rooftop Rhythms</div>
                </TableCell>
                 <TableCell className="hidden sm:table-cell">
                  <Badge className="text-xs" variant="outline">
                    Upcoming
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  2024-12-05
                </TableCell>
                <TableCell className="text-right">88/150</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
