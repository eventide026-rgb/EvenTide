'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function CoHostDashboardPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/cohost-dashboard/my-gigs');
    }, [router]);

    return (
      <div className="flex h-full min-h-[400px] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
}
