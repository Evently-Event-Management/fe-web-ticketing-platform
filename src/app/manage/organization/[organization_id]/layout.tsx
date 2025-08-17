'use client'

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useOrganization } from "@/providers/OrganizationProvider"
import {toast} from "sonner";

export default function OrganizationIdLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { organization } = useOrganization()
  const router = useRouter()

  useEffect(() => {
    // If no active organization is set, redirect to my-organizations page
    if (!organization) {
      toast.error("No active organization found. Redirecting to your organizations.")
      router.push('/manage/organization/my-organizations')
    }
  }, [organization, router])

  // Don't render children until we confirm there's an active organization
  // This prevents the page from flashing content before redirecting
  if (!organization) {
    return null
  }

  return <>{children}</>
}
