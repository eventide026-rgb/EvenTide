
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, DollarSign, Users, BookMarked, Car } from "lucide-react";
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

export default function CarHireDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline">Car Hire Dashboard</h1>
            <p className="text-muted-foreground">Welcome! Here's an overview of your vehicle rental business.</p>
          </div>
          <Button asChild>
            <Link href="/car-hire-dashboard/my-cars/new">Add New Car</Link>
          </Button>
       </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦850,000.00</div>
            <p className="text-xs text-muted-foreground">
              +25.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <BookMarked className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+58</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Listed Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12</div>
            <p className="text-xs text-muted-foreground">
              +3 since last quarter
            </p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Recent Booking Requests</CardTitle>
            <CardDescription>
              New inquiries for your vehicles.
            </CardDescription>
          </div>
          <Button asChild size="sm" className="ml-auto gap-1">
            <Link href="/car-hire-dashboard/bookings">
              View All
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead className="hidden sm:table-cell">Vehicle</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="text-right">Pickup Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Tunde Adebayo</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    tunde@example.com
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  Toyota Camry (2021)
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge className="text-xs" variant="default">
                    Confirmed
                  </Badge>
                </TableCell>
                <TableCell className="text-right">2024-11-05</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Chioma Nwosu</div>
                   <div className="hidden text-sm text-muted-foreground md:inline">
                    chioma.n@example.com
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  Mercedes-Benz G-Wagon
                </TableCell>
                 <TableCell className="hidden sm:table-cell">
                  <Badge className="text-xs" variant="outline">
                    Pending
                  </Badge>
                </TableCell>
                <TableCell className="text-right">2024-11-12</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
