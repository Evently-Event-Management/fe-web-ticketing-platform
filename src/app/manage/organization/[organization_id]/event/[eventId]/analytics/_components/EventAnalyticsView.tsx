import {EventAnalytics} from "@/types/eventAnalytics";
import {formatCurrency} from "@/lib/utils";
import {TierSalesChart} from "./TierSalesChart";
import {EventViewsChart} from "./EventViewsChart";
import {TrafficSourcesChart} from "./TrafficSourcesChart";
import {AudienceGeographyTable} from "./AudienceGeographyTable";
import {DeviceBreakdownChart} from "./DeviceBreakdownChart";
import React from "react";
import {Skeleton} from "@/components/ui/skeleton";
import {DollarSign, Eye, Ticket} from "lucide-react";
import {AnalyticsCard} from "./AnalyticsCard";
import {
    TierDistributionChart
} from "@/app/manage/organization/[organization_id]/event/[eventId]/analytics/_components/TierDistribution";

interface EventAnalyticsViewProps {
    analytics: EventAnalytics;
    isGaLoading?: boolean;
}

export const EventAnalyticsView: React.FC<EventAnalyticsViewProps> = ({analytics, isGaLoading = false}) => {
    return (
        <div className="space-y-6">
            {/* Top Level KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Revenue Performance Card */}
                <AnalyticsCard
                    title="Revenue Performance"
                    value={formatCurrency(analytics.totalRevenue, 'LKR', 'en-LK')}
                    subtitle={`${formatCurrency(analytics.averageRevenuePerTicket, 'LKR', 'en-LK')} avg. per ticket`}
                    icon={
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <DollarSign className="h-4 w-4"/>
                        </div>
                    }
                />

                {/* Sales Performance Card */}
                <AnalyticsCard
                    title="Sales Performance"
                    value={analytics.totalTicketsSold.toLocaleString()}
                    secondaryValue={analytics.totalEventCapacity.toLocaleString()}
                    subtitle={`${analytics.overallSellOutPercentage.toFixed(1)}% of total capacity sold`}
                    icon={
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Ticket className="h-4 w-4"/>
                        </div>
                    }
                />

                {/* Audience Engagement Card */}
                <AnalyticsCard
                    title="Audience Engagement"
                    value={(analytics.pageViews ?? 0).toLocaleString()}
                    subtitle={`${(analytics.conversionRate ?? 0).toFixed(2)}% conversion rate from views`}
                    icon={
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Eye className="h-4 w-4"/>
                        </div>
                    }
                    isLoading={isGaLoading}
                />
            </div>

            {/* Detailed Chart Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                <TierDistributionChart data={analytics.salesByTier}/>
                <TierSalesChart data={analytics.salesByTier}/>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {isGaLoading ? (
                    <>
                        <Skeleton className="w-full h-[300px]"/>
                        <Skeleton className="w-full h-[300px]"/>
                    </>

                ) : (
                    <>
                        {analytics.viewsTimeSeries && <EventViewsChart data={analytics.viewsTimeSeries}/>}
                        {analytics.deviceBreakdown && <DeviceBreakdownChart data={analytics.deviceBreakdown}/>}
                    </>
                )}
            </div>

            {/* GA Insights Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {isGaLoading ? (
                    <>
                        <Skeleton className="h-[300px] w-full"/>
                        <Skeleton className="h-[300px] w-full"/>
                    </>
                ) : (
                    <>
                        {analytics.trafficSources && <TrafficSourcesChart data={analytics.trafficSources}/>}
                        {analytics.audienceGeography &&
                            <AudienceGeographyTable data={analytics.audienceGeography}/>
                        }
                    </>
                )
                }
            </div>
        </div>
    )
        ;
};