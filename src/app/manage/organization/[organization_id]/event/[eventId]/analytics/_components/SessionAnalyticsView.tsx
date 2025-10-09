import {SessionAnalytics} from "@/types/eventAnalytics";
import {formatCurrency, formatDate, formatDateTimeShort, formatISODuration} from "@/lib/utils";
import { TierSalesMetrics } from "@/lib/actions/analyticsActions";
import {AnalyticsCard} from "./AnalyticsCard";
import {ArrowLeft, Clock, DollarSign, Ticket} from "lucide-react";
import {TierSalesChart} from "./TierSalesChart";
import {BlockOccupancyChart} from "./BlockOccupancyChart";
import {SessionStatusBadge} from "@/components/SessionStatusBadge";
import Link from "next/link";
import {usePathname} from 'next/navigation';
import {SeatStatusChart} from "./SeatStatusChart";
import {DailySalesChart} from "./DailySalesChart";
import {Skeleton} from "@/components/ui/skeleton";
import {
    TierDistributionChart
} from "@/app/manage/organization/[organization_id]/event/[eventId]/analytics/_components/TierDistribution";

export const SessionAnalyticsView: React.FC<{ 
    analytics: SessionAnalytics, 
    sessionAnalytics?: {
        total_revenue: number;
        total_before_discounts: number;
        total_tickets_sold: number;
        daily_sales: Array<{date: string; revenue: number; tickets_sold: number}>;
        sales_by_tier?: Array<{
            tier_id: string;
            tier_name: string;
            tier_color: string;
            tickets_sold: number;
            revenue: number;
        }>;
    },
    isLoading?: boolean
}> = ({analytics, sessionAnalytics, isLoading = false}) => {
    const pathname = usePathname();
    const eventAnalyticsPath = pathname.substring(0, pathname.lastIndexOf('/'));
    
    // Calculate average revenue per ticket
    const avgRevenuePerTicket = analytics.ticketsSold > 0
        ? analytics.sessionRevenue / analytics.ticketsSold
        : 0;
        
    // Calculate discount savings if we have session analytics data
    const totalDiscountSavings = sessionAnalytics
        ? sessionAnalytics.total_before_discounts - sessionAnalytics.total_revenue
        : 0;

    return (
        <div className="container mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{analytics.eventTitle}</h1>
                <div className="flex items-center gap-4 mt-2">
                    <p className="text-muted-foreground">
                        Session Details for {formatDate(analytics.startTime)} - {formatDate(analytics.endTime)}
                    </p>
                    <SessionStatusBadge status={analytics.sessionStatus}/>
                </div>
            </div>

            {/* Top Level KPI Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Revenue & Discount Card */}
                <AnalyticsCard
                    title="Revenue Performance"
                    value={formatCurrency(sessionAnalytics?.total_revenue || analytics.sessionRevenue, 'LKR', 'en-LK')}
                    subtitle={`${formatCurrency(avgRevenuePerTicket, 'LKR', 'en-LK')} avg. per ticket`}
                    secondaryValue={formatCurrency(totalDiscountSavings, 'LKR', 'en-LK')}
                    secondaryLabel={totalDiscountSavings > 0 
                        ? `${((totalDiscountSavings / sessionAnalytics!.total_before_discounts) * 100).toFixed(1)}% discount savings` 
                        : "No discounts applied"}
                    icon={
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <DollarSign className="h-4 w-4"/>
                        </div>
                    }
                    isLoading={isLoading}
                />
                
                {/* Sales Performance Card */}
                <AnalyticsCard
                    title="Sales Performance"
                    value={(sessionAnalytics?.total_tickets_sold || analytics.ticketsSold).toLocaleString()}
                    secondaryValue={analytics.sessionCapacity.toLocaleString()}
                    subtitle={`${analytics.sellOutPercentage.toFixed(1)}% of total capacity sold`}
                    icon={
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Ticket className="h-4 w-4"/>
                        </div>
                    }
                    isLoading={isLoading}
                />
                
                {/* Sales Window Card */}
                <AnalyticsCard
                    title="Sales Window"
                    value={analytics.sessionStatus === 'SCHEDULED' ? `Start on ${formatDate(analytics.salesStartTime)}` : analytics.sessionStatus === 'ON_SALE' ? `Started on ${formatDateTimeShort(analytics.salesStartTime)}` : `Ended on ${formatDateTimeShort(analytics.startTime)}`}
                    subtitle={`Sales window: ${formatISODuration(analytics.salesWindowDuration)}`}
                    icon={
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Clock className="h-4 w-4"/>
                        </div>
                    }
                />
            </div>

            {/* Daily Sales Chart */}
            {sessionAnalytics?.daily_sales && sessionAnalytics.daily_sales.length > 0 && (
                <div className="grid grid-cols-1">
                    {isLoading ? (
                        <Skeleton className="w-full h-[350px]"/>
                    ) : (
                        <div className="lg:col-span-2">
                            <DailySalesChart data={sessionAnalytics.daily_sales} />
                        </div>
                    )}
                </div>
            )}
            
            {/* Charts */}
            <div className="grid gap-8 lg:grid-cols-2">
                <TierSalesChart data={sessionAnalytics?.sales_by_tier || analytics.salesByTier}/>
                <BlockOccupancyChart data={analytics.occupancyByBlock}/>
                <TierDistributionChart data={analytics.salesByTier}/>
                <SeatStatusChart seatStatusBreakdown={analytics.seatStatusBreakdown}/>
            </div>
        </div>
    );
};