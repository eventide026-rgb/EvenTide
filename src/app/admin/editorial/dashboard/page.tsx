'use client';

import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { IssueCard, type Issue } from '@/components/admin/issue-card';
import { type MagazineIssue } from '@/app/admin/editorial/magazine/page';

export default function EditorialAdminDashboardPage() {
  const firestore = useFirestore();

  const issuesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "magazineIssues"), limit(8));
  }, [firestore]);

  const { data: issues, isLoading } = useCollection<MagazineIssue>(issuesQuery);

  const weeklyIssues: Issue[] = issues
    ?.filter(issue => issue.title.includes('Weekly'))
    .map(issue => ({
        title: issue.title,
        status: issue.status === 'published' ? 'Published' : 'Draft',
        description: issue.introduction.substring(0, 80) + '...',
        action: {
            href: issue.status === 'draft' ? `/admin/editorial/magazine?issueId=${issue.id}` : `/resources/magazine/${issue.id}`,
            label: issue.status === 'draft' ? 'Edit Draft' : 'View Published'
        }
    })) || [];
  
  const monthlyIssues: Issue[] = issues
    ?.filter(issue => !issue.title.includes('Weekly'))
    .map(issue => ({
        title: issue.title,
        status: issue.status === 'published' ? 'Published' : 'Draft',
        description: issue.introduction.substring(0, 80) + '...',
        action: {
            href: issue.status === 'draft' ? `/admin/editorial/magazine?issueId=${issue.id}` : `/resources/magazine/${issue.id}`,
            label: issue.status === 'draft' ? 'Edit Draft' : 'View Published'
        }
    })) || [];


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
            {isLoading ? <Loader2 className="animate-spin" /> : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {weeklyIssues.length > 0 ? weeklyIssues.map((issue, index) => (
                        <IssueCard key={index} issue={issue} />
                    )) : <p className="text-muted-foreground">No weekly issues found.</p>}
                </div>
            )}
        </div>
        <div>
            <h2 className="text-2xl font-semibold font-headline mb-4">Monthly Issues</h2>
             {isLoading ? <Loader2 className="animate-spin" /> : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {monthlyIssues.length > 0 ? monthlyIssues.map((issue, index) => (
                        <IssueCard key={index} issue={issue} />
                    )) : <p className="text-muted-foreground">No monthly issues found.</p>}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
