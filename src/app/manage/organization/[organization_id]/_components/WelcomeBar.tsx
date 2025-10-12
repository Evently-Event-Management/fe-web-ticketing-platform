'use client';

import { useOrganization } from '@/providers/OrganizationProvider';
import { Button } from '@/components/ui/button';
import { PlusCircle, BarChart2, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export const WelcomeBar = () => {
  const { organization } = useOrganization();
  const params = useParams<{ organization_id: string }>();

  return (
    <div className="rounded-lg border bg-card p-6 mb-8 animate-gradient">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome to {organization?.name || 'Your Organization'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your events, monitor performance and grow your audience
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div>
            <Link href={`/manage/organization/${params.organization_id}/event/create`}>
              <Button variant="default">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </Link>
          </div>
          
          <div>
            <Link href={`/manage/organization/${params.organization_id}/staff`}>
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Manage Staff
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};