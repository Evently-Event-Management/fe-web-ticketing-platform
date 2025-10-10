"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SessionsPageLink: React.FC = () => {
  const params = useParams();
  const organizationId = params.organization_id as string;
  const eventId = params.event_id as string;
  
  if (!organizationId || !eventId) return null;
  
  return (
    <Link href={`/manage/organization/${organizationId}/event/${eventId}/sessions`}>
      <Button variant="outline" size="sm">
        <CalendarDays className="mr-2 h-4 w-4" />
        Manage Sessions
      </Button>
    </Link>
  );
};