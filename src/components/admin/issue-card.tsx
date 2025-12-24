'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export type IssueStatus = 'Draft' | 'Preview' | 'Published';

export type Issue = {
  title: string;
  status: IssueStatus;
  description: string;
  action: {
    href: string;
    label: string;
  };
};

type IssueCardProps = {
  issue: Issue;
};

export function IssueCard({ issue }: IssueCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{issue.title}</CardTitle>
            <Badge
                variant={
                    issue.status === 'Published' ? 'default' :
                    issue.status === 'Preview' ? 'secondary' :
                    'outline'
                }
                className={cn(issue.status === 'Published' && 'bg-green-600 hover:bg-green-600/80')}
            >
                {issue.status}
            </Badge>
        </div>
        <CardDescription>{issue.description}</CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto">
        <Button asChild variant="secondary" className="w-full">
            <Link href={issue.action.href}>
                {issue.action.label}
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
