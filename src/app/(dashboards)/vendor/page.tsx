
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Check, Clock, Eye, Sparkles, TrendingUp } from "lucide-react";
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
                    <h1 className="text-3xl font-bold font-headline">Vendor Command Center</h1>
                    <p className="text-muted-foreground">Manage your gigs and track your marketplace visibility.</p>
                </div>
                <Button asChild>
                    <Link href="/vendor/profile">Public Storefront</Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-primary/10 to-background border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Gigs</CardTitle>
                        <Briefcase className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">Upcoming deliveries</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Matching Engine</CardTitle>
                        <Sparkles className="h-4 w-4 text-accent" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">Recommended this week</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Visibility</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">842</div>
                        <p className="text-xs text-muted-foreground">Marketplace profile views</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversion</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">14%</div>
                        <p className="text-xs text-muted-foreground">+2% from last month</p>
                    </CardContent>
                </Card>
            </div>

             <div className="grid lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Upcoming Gigs</CardTitle>
                        <CardDescription>Your confirmed event timeline.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Event</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>
                                        <div className="font-medium">Olowu Traditional Wedding</div>
                                        <div className="text-xs text-muted-foreground">Lagos &bull; 250 Guests</div>
                                    </TableCell>
                                    <TableCell><Badge variant="secondary">Photography</Badge></TableCell>
                                    <TableCell className="text-sm">Dec 15</TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="ghost" asChild><Link href="/vendor/my-gigs/1">Manage</Link></Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary"/> Marketplace Insights</CardTitle>
                        <CardDescription>How you're performing in the Matching Engine.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Match Accuracy</span>
                                <span className="font-bold">92%</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: '92%' }} />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <p className="text-xs text-muted-foreground">You are being recommended most for:</p>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="outline">Traditional Weddings</Badge>
                                <Badge variant="outline">Corporate Galas</Badge>
                                <Badge variant="outline">Lagos Island</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
             </div>
        </div>
    );
}
