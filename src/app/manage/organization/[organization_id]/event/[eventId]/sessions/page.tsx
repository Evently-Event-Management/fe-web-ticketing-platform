"use client";

import { SessionsManager } from '@/app/manage/organization/[organization_id]/event/_components/sessions/sessions-manager';
import { useState } from 'react';

export default function SessionsPage() {
  // Set up state for view mode similar to the discount page
  const [mode, setMode] = useState<'view' | 'create' | 'edit'>('view');
  const [editingSession, setEditingSession] = useState<null>(null);

  // If in the future we implement editing or creating, we can use the mode state
  // to conditionally render different views, just like in the discount page
  
  return (
    <div className="p-4 md:p-8 w-full">
      <SessionsManager />
    </div>
  );
}