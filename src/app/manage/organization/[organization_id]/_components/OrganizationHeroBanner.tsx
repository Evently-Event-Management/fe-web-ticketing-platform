"use client";

import Link from "next/link";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {OrganizationResponse} from "@/types/oraganizations";
import {CalendarDays, Globe2, Sparkles} from "lucide-react";

interface OrganizationHeroBannerProps {
    organization: OrganizationResponse;
}

const DEFAULT_COVER_IMAGE = "/images/organization-cover.svg";

export const OrganizationHeroBanner: React.FC<OrganizationHeroBannerProps> = ({organization}) => {
    const coverImage = organization.logoUrl ?? DEFAULT_COVER_IMAGE;
    const createdDate = organization.createdAt ? new Date(organization.createdAt) : null;
    const formattedCreatedAt = createdDate && !Number.isNaN(createdDate.getTime())
        ? createdDate.toLocaleDateString("en-LK", {year: "numeric", month: "short"})
        : null;

    return (
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-black text-white shadow-[0_32px_120px_-60px_rgba(15,23,42,0.65)]">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{backgroundImage: `url("${coverImage}")`}}
                aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-black/70"/>
            <div className="absolute -left-20 top-1/4 h-64 w-64 rounded-full bg-primary/30 blur-3xl"/>
            <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl"/>

            <div className="relative z-10 flex flex-col gap-8 p-8 md:flex-row md:items-end md:justify-between md:p-12">
                <div className="space-y-6 text-white">
                    <Badge className="w-fit border-white/30 bg-white/10 text-white backdrop-blur"><Sparkles className="mr-1.5 h-3.5 w-3.5"/>Organization hub</Badge>
                    <div className="space-y-4">
                        <h1 className={cn("text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl")}>{organization.name}</h1>
                        <p className="max-w-2xl text-sm text-white/70 sm:text-base">
                            Craft unforgettable experiences, manage your teams, and track your performance in one beautiful command center.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-white/75">
                        {organization.website && (
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">
                                <Globe2 className="h-4 w-4"/>
                                {organization.website}
                            </span>
                        )}
                        {formattedCreatedAt && (
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">
                                <CalendarDays className="h-4 w-4"/>
                                {formattedCreatedAt}
                            </span>
                        )}
                        {typeof organization.eventCount === "number" && (
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">
                                <Sparkles className="h-4 w-4"/>
                                {organization.eventCount} events launched
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex w-full flex-col items-start gap-3 md:w-auto md:items-end">
                    <Button
                        asChild
                        size="lg"
                        className="border-white/30 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
                    >
                        <Link href={`/manage/organization/${organization.id}/event/create`}>Create new event</Link>
                    </Button>
                    <p className="text-xs text-white/60">
                        Keep building your brand—every event adds to your story.
                    </p>
                </div>
            </div>
        </section>
    );
};
