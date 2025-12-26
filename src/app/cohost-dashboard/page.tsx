
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CoHostDashboardPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/cohost-dashboard/my-gigs');
    }, [router]);

    return null;
}
