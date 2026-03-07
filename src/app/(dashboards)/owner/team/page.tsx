
'use client';

import { TeamManagement } from '@/components/dashboard/team-management';

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <header className="pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold font-headline">Team Management</h1>
          <p className="text-muted-foreground">
            Invite and manage planners, co-hosts, and security personnel for your events.
          </p>
        </div>
      </header>
      <TeamManagement />
    </div>
  );
}
