import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, DollarSign, Users, PartyPopper } from "lucide-react";
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

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's a high-level overview of your events.</p>
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
            <div className="text-2xl font-bold">₦45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <PartyPopper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12</div>
            <p className="text-xs text-muted-foreground">
              +2 since last week
            </p>
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
            <Link href="/events">
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
                <TableHead className="text-right">Guests</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Adebayo & Funke's Wedding</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    WE-O-A4F8K2
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge className="text-xs" variant="outline">
                    Upcoming
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  2024-08-15
                </TableCell>
                <TableCell className="text-right">250/300</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Lagos Tech Summit</div>
                   <div className="hidden text-sm text-muted-foreground md:inline">
                    CN-P-L9S3T1
                  </div>
                </TableCell>
                 <TableCell className="hidden sm:table-cell">
                  <Badge className="text-xs" variant="outline">
                    Upcoming
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  2024-09-02
                </TableCell>
                <TableCell className="text-right">450/500</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
