
'use client';

import { MoodBoardClient } from '@/components/planner/mood-board-client';

export default function MoodBoardPage() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <header>
        <h1 className="text-3xl font-bold font-headline">Mood Board</h1>
        <p className="text-muted-foreground">Craft the visual identity of your event.</p>
      </header>
      <div className="flex-1">
        <MoodBoardClient isReadOnly={false} />
      </div>
    </div>
  );
}
