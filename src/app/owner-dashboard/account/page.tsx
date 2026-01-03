
'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// This page is a redirect to the main account page.
export default function AccountRedirectPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/account');
    }, [router]);

    return null;
}
