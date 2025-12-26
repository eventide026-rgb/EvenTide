
'use client';

import { MenuPlannerClient } from '@/components/planner/menu-planner-client';

export default function MenuPlannerPage() {
  return (
    <div className="space-y-6">
       <header>
        <h1 className="text-3xl font-bold font-headline">Menu Planner</h1>
        <p className="text-muted-foreground">Design the culinary journey for the event.</p>
      </header>
      <MenuPlannerClient />
    </div>
  );
}
