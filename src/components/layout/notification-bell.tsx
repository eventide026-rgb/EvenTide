
'use client';

import { useState, useMemo } from 'react';
import { Bell, MailOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, doc, writeBatch } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';
import { Separator } from '../ui/separator';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { usePathname } from 'next/navigation';

type Notification = {
    id: string;
    message: string;
    link: string;
    read: boolean;
    createdAt: any;
};

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const pathname = usePathname();

    const notificationsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, 'users', user.uid, 'notifications'),
            orderBy('createdAt', 'desc'),
            limit(5)
        );
    }, [firestore, user]);

    const { data: notifications, isLoading } = useCollection<Notification>(notificationsQuery);
    
    const unreadCount = useMemo(() => {
        return notifications?.filter(n => !n.read).length || 0;
    }, [notifications]);

    const handleMarkAllAsRead = async () => {
        if (!firestore || !user || !notifications) return;
        
        const batch = writeBatch(firestore);
        notifications.forEach(notif => {
            if (!notif.read) {
                const notifRef = doc(firestore, 'users', user.uid, 'notifications', notif.id);
                batch.update(notifRef, { read: true });
            }
        });
        await batch.commit();
    };

    const getDashboardPrefix = () => {
        const parts = pathname.split('/');
        if (parts.length > 1 && parts[1].endsWith('-dashboard')) {
            return `/${parts[1]}`;
        }
        // Fallback for account pages or other nested routes
        if(pathname.startsWith('/owner-dashboard') || pathname.startsWith('/account')) return '/owner-dashboard';
        if(pathname.startsWith('/planner-dashboard')) return '/planner-dashboard';
        if(pathname.startsWith('/vendor-dashboard')) return '/vendor-dashboard';
        if(pathname.startsWith('/cohost-dashboard')) return '/cohost-dashboard';
        if(pathname.startsWith('/ticketier-dashboard')) return '/ticketier-dashboard';
        return '/owner-dashboard'; // Default fallback
    }

    const inboxLink = `${getDashboardPrefix()}/notifications`;

    const NotificationItem = ({ notif }: { notif: Notification }) => (
        <Link href={notif.link} className="block rounded-md p-2 hover:bg-accent -mx-2" onClick={() => setIsOpen(false)}>
            <p className={cn("text-sm", !notif.read && "font-bold")}>{notif.message}</p>
            <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true })}
            </p>
        </Link>
    )

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <Tooltip>
                <PopoverTrigger asChild>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-lg">
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <Badge variant="destructive" className="absolute top-1 right-1 h-5 w-5 flex items-center justify-center p-0">
                                    {unreadCount}
                                </Badge>
                            )}
                        </Button>
                    </TooltipTrigger>
                </PopoverTrigger>
                <TooltipContent side="right">Notifications</TooltipContent>
            </Tooltip>
            <PopoverContent align="end" className="w-80 p-2">
                <div className="flex items-center justify-between p-2">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button variant="link" size="sm" className="h-auto p-0" onClick={handleMarkAllAsRead}>
                            Mark all as read
                        </Button>
                    )}
                </div>
                <Separator />
                <div className="p-2 max-h-80 overflow-y-auto">
                    {isLoading || isUserLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : notifications && notifications.length > 0 ? (
                        <ul className="space-y-1">
                           {notifications.map(notif => (
                               <li key={notif.id}><NotificationItem notif={notif} /></li>
                           ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8">
                            <MailOpen className="mx-auto h-10 w-10 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">You're all caught up.</p>
                        </div>
                    )}
                </div>
                <Separator />
                <div className="p-2">
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                        <Link href={inboxLink} onClick={() => setIsOpen(false)}>View all in Inbox</Link>
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
