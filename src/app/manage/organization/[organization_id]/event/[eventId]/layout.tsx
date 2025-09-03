"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams, useRouter, usePathname } from "next/navigation";
import {
  Home,
  BarChart2,
  CalendarCheck,
  Settings,
} from "lucide-react";

export default function EventDetailsLayout({
                                             children,
                                           }: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();

  const eventId = params.eventId as string;
  const organizationId = params.organization_id as string;
  const basePath = `/manage/organization/${organizationId}/event/${eventId}`;

  // Determine the active tab based on the current path
  const getActiveTab = () => {
    if (pathname.includes("/analytics")) return "analytics";
    if (pathname.includes("/sessions")) return "sessions";
    if (pathname.includes("/settings")) return "settings";
    return "overview";
  };

  const handleTabChange = (value: string) => {
    switch (value) {
      case "overview":
        router.push(basePath);
        break;
      case "analytics":
        router.push(`${basePath}/analytics`);
        break;
      case "sessions":
        router.push(`${basePath}/sessions`);
        break;
      case "settings":
        router.push(`${basePath}/settings`);
        break;
    }
  };

  // Tab definitions with icons
  const tabItems = [
    { name: "Overview", value: "overview", icon: Home },
    { name: "Analytics", value: "analytics", icon: BarChart2 },
    { name: "Sessions", value: "sessions", icon: CalendarCheck },
    { name: "Settings", value: "settings", icon: Settings },
  ];

  return (
      <div className="space-y-6 p-4">
        <Tabs
            value={getActiveTab()}
            onValueChange={handleTabChange}
            className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4 rounded-lg shadow-sm">
            {tabItems.map((tab) => {
              const Icon = tab.icon;
              return (
                  <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="
                  flex items-center justify-center gap-2
                  data-[state=active]:bg-primary
                  data-[state=active]:text-primary-foreground
                  dark:data-[state=active]:bg-primary
                  dark:data-[state=active]:text-primary-foreground
                  hover:bg-primary/10 dark:hover:bg-primary/20
                  transition-all duration-200
                "
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                  </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        <div className="mt-4">{children}</div>
      </div>
  );
}
