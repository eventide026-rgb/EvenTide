
'use client';

import { UserProfileForm } from '@/components/forms/user-profile-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AccountPage() {
    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>My Account</CardTitle>
                <CardDescription>
                    Manage your personal information. This information is shared across all your roles on EvenTide.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <UserProfileForm />
            </CardContent>
        </Card>
    );
}
