
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function LegacyRedirect() {
    const router = useRouter();
    useEffect(() => { router.replace('/owner/find-venue'); }, [router]);
    return null;
}
