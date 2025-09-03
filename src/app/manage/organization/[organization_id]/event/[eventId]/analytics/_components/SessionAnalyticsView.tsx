import {SessionAnalytics} from "@/types/eventAnalytics";
import {formatCurrency, formatDate, formatDateTimeShort, formatISODuration} from "@/lib/utils";
import {AnalyticsCard} from "./AnalyticsCard";
import {ArrowLeft, Clock, DollarSign, Ticket} from "lucide-react";
import {TierSalesChart} from "./TierSalesChart";
import {BlockOccupancyChart} from "./BlockOccupancyChart";
import {SessionStatusBadge} from "@/components/SessionStatusBadge";
import Link from "next/link";
import {usePathname} from 'next/navigation';
import {SeatStatusChart} from "./SeatStatusChart";
import {
    TierDistributionChart
} from "@/app/manage/organization/[organization_id]/event/[eventId]/analytics/_components/TierDistribution";

export const SessionAnalyticsView: React.FC<{ analytics: SessionAnalytics }> = ({analytics}) => {
    const pathname = usePathname();
    const eventAnalyticsPath = pathname.substring(0, pathname.lastIndexOf('/'));

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <div>
                <Link href={eventAnalyticsPath}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                    <ArrowLeft className="h-4 w-4"/>
                    Back to Event Overview
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">{analytics.eventTitle}</h1>
                <div className="flex items-center gap-4 mt-2">
                    <p className="text-muted-foreground">
                        Session Details for {formatDate(analytics.startTime)}
                    </p>
                    <SessionStatusBadge status={analytics.sessionStatus}/>
                </div>
            </div>

            {/* ++ Metric Cards consolidated into a 3-column layout ++ */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnalyticsCard
                    title="Session Revenue"
                    value={formatCurrency(analytics.sessionRevenue)}
                    subtitle={`${formatCurrency((analytics.sessionRevenue / analytics.ticketsSold), 'LKR', 'en-LK')} avg. per ticket`}
                    icon={
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <DollarSign className="h-4 w-4 text-muted-foreground"/>
                        </div>
                    }
                />
                <AnalyticsCard
                    title="Tickets Sold"
                    value={analytics.ticketsSold}
                    secondaryValue={analytics.sessionCapacity}
                    subtitle={`${analytics.sellOutPercentage.toFixed(1)}% Sell-Out`}
                    icon={
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Ticket className="h-4 w-4 text-muted-foreground"/>
                        </div>
                    }

                />
                <AnalyticsCard
                    title="Time Until Start"
                    value={analytics.sessionStatus === 'SCHEDULED' ? formatDate(analytics.startTime) : analytics.sessionStatus === 'ON_SALE' ? `Started on ${formatDateTimeShort(analytics.startTime)}` : `Ended on ${formatDateTimeShort(analytics.endTime)}`}
                    subtitle={`Sales window: ${formatISODuration(analytics.salesWindowDuration)}`}
                    icon={
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Clock className="h-4 w-4 text-muted-foreground"/>
                        </div>
                    }
                />
            </div>

            {/* Charts */}
            <div className="grid gap-8 lg:grid-cols-2">
                <TierSalesChart data={analytics.salesByTier}/>
                <BlockOccupancyChart data={analytics.occupancyByBlock}/>
                <TierDistributionChart data={analytics.salesByTier}/>
                <SeatStatusChart seatStatusBreakdown={analytics.seatStatusBreakdown}/>
            </div>
        </div>
    );
};