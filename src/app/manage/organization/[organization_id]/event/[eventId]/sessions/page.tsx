"use client";

import * as React from "react";
import { useEventContext } from "@/providers/EventProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";

export default function EventSessionsPage() {
  const { event, isLoading, error } = useEventContext();

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 w-full">
        <div className="max-w-5xl mx-auto">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto p-8 flex flex-col items-center justify-center text-center">
        <div className="p-4 bg-destructive/10 rounded-full mb-4">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold text-destructive">
          {error || "Event not found"}
        </h2>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          Event Sessions for {event.title}
        </h1>
        <p className="text-muted-foreground">
          Manage your event sessions and scheduling here.
        </p>
      </div>
    </div>
  );
}
