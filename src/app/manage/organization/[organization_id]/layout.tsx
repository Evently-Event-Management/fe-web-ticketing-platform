"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOrganization } from "@/providers/OrganizationProvider";
import { toast } from "sonner";

export default function OrganizationIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { organization, isLoading } = useOrganization();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're not in a loading state and there's no organization
    if (!isLoading && !organization) {
      toast.error(
        "No active organization found. Redirecting to your organizations."
      );
      router.push("/manage/organization/my-organizations");
    }
  }, [organization, router, isLoading]);

  // Show loading indicator or null while we wait for organization data
  if (isLoading) {
    return null; // Or return a loading spinner component if you have one
  }

  // Don't render children until we confirm there's an active organization
  if (!organization) {
    return null;
  }

  return <>{children}</>;
}
