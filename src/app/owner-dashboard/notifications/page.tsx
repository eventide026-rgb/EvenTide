
'use client';

import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MailOpen } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

type Notification = {
    id: string;
    message: string;
    link: string;
    read: boolean;
    createdAt: any;
};

export default function NotificationsPage() {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();

    const notificationsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'users', user.uid, 'notifications'), orderBy('createdAt', 'desc'));
    }, [firestore, user]);

    const { data: notifications, isLoading } = useCollection<Notification>(notificationsQuery);

    const handleMarkAsRead = async (notificationId: string) => {
        if (!firestore || !user) return;
        const notifRef = doc(firestore, 'users', user.uid, 'notifications', notificationId);
        await updateDoc(notifRef, { read: true });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>All your event-related notifications in one place.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading || isUserLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : notifications && notifications.length > 0 ? (
                    <ul className="space-y-4">
                        {notifications.map(notif => (
                            <li key={notif.id}>
                                <Link href={notif.link} onClick={() => !notif.read && handleMarkAsRead(notif.id)}>
                                    <div className={cn(
                                        "block border p-4 rounded-lg transition-colors hover:bg-accent",
                                        !notif.read ? "bg-accent/50 border-primary/50" : "bg-transparent"
                                    )}>
                                        <p className={cn("font-medium", !notif.read && "font-bold")}>{notif.message}</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true })}
                                        </p>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-16 border-dashed border-2 rounded-lg">
                        <MailOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-xl font-semibold">All caught up!</h3>
                        <p className="mt-1 text-muted-foreground">You have no new notifications.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
