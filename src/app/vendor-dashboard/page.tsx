
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Check, Clock, Eye, MoreVertical } from "lucide-react";
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

export default function VendorDashboardPage() {
    return (
        <div className="flex flex-col gap-8">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Vendor Dashboard</h1>
                    <p className="text-muted-foreground">Welcome! Here's an overview of your gigs.</p>
                </div>
                <Button asChild>
                    <Link href="/vendor-dashboard/profile">Manage My Profile</Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Gigs</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">Confirmed and upcoming jobs</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Proposals</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2</div>
                        <p className="text-xs text-muted-foreground">Awaiting your response</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed Gigs</CardTitle>
                        <Check className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">18</div>
                        <p className="text-xs text-muted-foreground">Successfully delivered services</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,204</div>
                        <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                </Card>
            </div>

             <Card>
                <CardHeader>
                    <CardTitle>Upcoming Gigs</CardTitle>
                    <CardDescription>Your next few confirmed jobs.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Event</TableHead>
                                <TableHead>Role/Service</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>
                                    <div className="font-medium">Adebayo & Funke's Wedding</div>
                                    <div className="text-sm text-muted-foreground">Planner: Chioma Nwosu</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">Lead Photographer</Badge>
                                </TableCell>
                                <TableCell>2024-12-15</TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href="/vendor-dashboard/my-gigs/1">View Details</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>
                                    <div className="font-medium">Lagos Tech Summit 2024</div>
                                     <div className="text-sm text-muted-foreground">Planner: Tunde Adebayo</div>
                                </TableCell>
                                <TableCell>
                                     <Badge variant="secondary">Event Photography</Badge>
                                </TableCell>
                                <TableCell>2024-11-02</TableCell>
                                <TableCell className="text-right">
                                     <Button asChild variant="outline" size="sm">
                                        <Link href="/vendor-dashboard/my-gigs/2">View Details</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
