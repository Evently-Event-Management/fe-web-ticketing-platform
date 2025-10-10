import { SessionsManager } from '@/app/manage/organization/[organization_id]/event/_components/sessions/sessions-manager';

export default function SessionsPage() {
  return (
    <div className="p-4 md:p-8 w-full">
      <SessionsManager />
    </div>
  );
}