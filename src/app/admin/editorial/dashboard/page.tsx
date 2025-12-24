'use client';

import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { IssueCard, type Issue } from '@/components/admin/issue-card';

const weeklyIssues: Issue[] = [
  {
    title: 'Weekly Issue: Nov 24',
    status: 'Published',
    description: 'Featuring the Lagos Tech Summit and Adebayo wedding highlights.',
    action: {
      href: '#',
      label: 'View Analytics',
    },
  },
  {
    title: 'Weekly Issue: Dec 01',
    status: 'Draft',
    description: 'AI-generated draft ready for review. Includes winter festival events.',
    action: {
      href: '/admin/editorial/magazine',
      label: 'Edit Draft',
    },
  },
];

const monthlyIssues: Issue[] = [
    {
        title: 'November 2024 Issue',
        status: 'Published',
        description: 'A deep dive into the evolution of event design in Nigeria.',
        action: {
          href: '#',
          label: 'View Analytics',
        },
    },
    {
        title: 'December 2024 Issue',
        status: 'Preview',
        description: 'Sent to stakeholders for final review before publishing.',
        action: {
          href: '#',
          label: 'Manage Preview',
        },
    }
];

export default function EditorialAdminDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Issues Dashboard</h1>
          <p className="text-muted-foreground">Manage and publish the EvenTide Community Magazine.</p>
        </div>
        <Button asChild>
            <Link href="/admin/editorial/magazine">
                <PlusCircle className="mr-2 h-4 w-4" />
                Generate New Issue
            </Link>
        </Button>
      </div>

      <div className="space-y-8">
        <div>
            <h2 className="text-2xl font-semibold font-headline mb-4">Weekly Issues</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {weeklyIssues.map((issue, index) => (
                    <IssueCard key={index} issue={issue} />
                ))}
            </div>
        </div>
        <div>
            <h2 className="text-2xl font-semibold font-headline mb-4">Monthly Issues</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                 {monthlyIssues.map((issue, index) => (
                    <IssueCard key={index} issue={issue} />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
