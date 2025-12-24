
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, DollarSign, Users, BookMarked, Building } from "lucide-react";
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

export default function HallOwnerDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline">Venue Dashboard</h1>
            <p className="text-muted-foreground">Welcome! Here's an overview of your venue business.</p>
          </div>
          <Button asChild>
            <Link href="/hall-owner-dashboard/my-venues/new">Add New Venue</Link>
          </Button>
       </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦2,550,000.00</div>
            <p className="text-xs text-muted-foreground">
              +18.3% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <BookMarked className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+35</div>
            <p className="text-xs text-muted-foreground">
              +10% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Listed Venues</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2</div>
            <p className="text-xs text-muted-foreground">
              +1 since last year
            </p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Recent Booking Requests</CardTitle>
            <CardDescription>
              New inquiries for your venues.
            </CardDescription>
          </div>
          <Button asChild size="sm" className="ml-auto gap-1">
            <Link href="/hall-owner-dashboard/bookings">
              View All
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead className="hidden sm:table-cell">Venue</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="text-right">Event Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Adebayo & Funke's Wedding</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    planner@example.com
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  The Grand Atrium
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge className="text-xs" variant="default">
                    Confirmed
                  </Badge>
                </TableCell>
                <TableCell className="text-right">2024-10-26</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Lagos Tech Summit 2024</div>
                   <div className="hidden text-sm text-muted-foreground md:inline">
                    tech-events@example.com
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  Oceanview Conference Hall
                </TableCell>
                 <TableCell className="hidden sm:table-cell">
                  <Badge className="text-xs" variant="outline">
                    Pending
                  </Badge>
                </TableCell>
                <TableCell className="text-right">2024-11-15</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
