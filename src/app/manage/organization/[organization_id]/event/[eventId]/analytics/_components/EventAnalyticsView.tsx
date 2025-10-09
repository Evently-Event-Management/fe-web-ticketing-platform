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
import { DailySalesChart } from "./DailySalesChart";
import { DailySalesMetrics } from "@/lib/actions/analyticsActions";

interface EventAnalyticsViewProps {
    analytics: EventAnalytics;
    revenueAnalytics?: {
        total_revenue: number;
        total_before_discounts: number;
        total_tickets_sold: number;
        daily_sales: DailySalesMetrics[];
    };
    isGaLoading?: boolean;
    isRevenueLoading?: boolean;
}

export const EventAnalyticsView: React.FC<EventAnalyticsViewProps> = ({
    analytics,
    revenueAnalytics,
    isGaLoading = false,
    isRevenueLoading = false
}) => {
    // Calculate average revenue per ticket
    const avgRevenuePerTicket = revenueAnalytics && revenueAnalytics.total_tickets_sold > 0
        ? revenueAnalytics.total_revenue / revenueAnalytics.total_tickets_sold
        : 0;

    // Calculate discount savings
    const totalDiscountSavings = revenueAnalytics
        ? revenueAnalytics.total_before_discounts - revenueAnalytics.total_revenue
        : 0;

    return (
        <div className="space-y-6">
            {/* Top Level KPI Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Revenue & Discount Card */}
                <AnalyticsCard
                    title="Revenue Performance"
                    value={formatCurrency(revenueAnalytics?.total_revenue || analytics.totalRevenue, 'LKR', 'en-LK')}
                    subtitle={`${formatCurrency(avgRevenuePerTicket || analytics.averageRevenuePerTicket, 'LKR', 'en-LK')} avg. per ticket`}
                    secondaryValue={formatCurrency(totalDiscountSavings, 'LKR', 'en-LK')}
                    secondaryLabel={totalDiscountSavings > 0
                        ? `${((totalDiscountSavings / revenueAnalytics!.total_before_discounts) * 100).toFixed(1)}% discount savings`
                        : "No discounts applied"}
                    icon={
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <DollarSign className="h-4 w-4"/>
                        </div>
                    }
                    isLoading={isRevenueLoading}
                />

                {/* Sales Performance Card */}
                <AnalyticsCard
                    title="Sales Performance"
                    value={(revenueAnalytics?.total_tickets_sold || analytics.totalTicketsSold).toLocaleString()}
                    secondaryValue={analytics.totalEventCapacity.toLocaleString()}
                    subtitle={`${analytics.overallSellOutPercentage.toFixed(1)}% of total capacity sold`}
                    icon={
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Ticket className="h-4 w-4"/>
                        </div>
                    }
                    isLoading={isRevenueLoading}
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
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Daily Sales Chart - Spanning full width */}
                {revenueAnalytics?.daily_sales && revenueAnalytics.daily_sales.length > 0 && (
                    <div className="w-full lg:col-span-2">
                        {isRevenueLoading ? (
                            <Skeleton className="w-full h-[350px]"/>
                        ) : (
                            <DailySalesChart data={revenueAnalytics.daily_sales} />
                        )}
                    </div>
                )}
                
                {/* Tier Charts */}
                <TierDistributionChart data={analytics.salesByTier}/>
                <TierSalesChart data={analytics.salesByTier}/>

                {/* Google Analytics Charts */}
                {isGaLoading ? (
                    <>
                        <Skeleton className="w-full h-[300px]"/>
                        <Skeleton className="w-full h-[300px]"/>
                        <Skeleton className="h-[300px] w-full lg:col-span-2"/>
                    </>
                ) : (
                    <>
                        {analytics.viewsTimeSeries && <EventViewsChart data={analytics.viewsTimeSeries}/>}
                        {analytics.deviceBreakdown && <DeviceBreakdownChart data={analytics.deviceBreakdown}/>}
                        {analytics.trafficSources && <TrafficSourcesChart data={analytics.trafficSources}/>}
                        {analytics.audienceGeography && <AudienceGeographyTable data={analytics.audienceGeography}/>}
                    </>
                )}
            </div>
        </div>
    );
};
