import { SessionAnalytics } from "@/types/eventAnalytics";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AnalyticsCard } from "./AnalyticsCard";
import { ArrowLeft, DollarSign, Percent, Ticket } from "lucide-react";
import { TierSalesChart } from "./TierSalesChart";
import { BlockOccupancyChart } from "./BlockOccupancyChart";
import { SessionStatusBadge } from "@/components/SessionStatusBadge";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { SeatStatusCard } from "./SeatStatusCard";

export const SessionAnalyticsView: React.FC<{ analytics: SessionAnalytics }> = ({ analytics }) => {
    const pathname = usePathname();
    // Dynamically construct the "back" link to the main event analytics page
    const eventAnalyticsPath = pathname.substring(0, pathname.lastIndexOf('/'));

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <div>
                <Link href={eventAnalyticsPath} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Event Overview
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">{analytics.eventTitle}</h1>
                <div className="flex items-center gap-4 mt-2">
                    <p className="text-muted-foreground">
                        Session Details for {formatDate(analytics.startTime)}
                    </p>
                    <SessionStatusBadge status={analytics.sessionStatus} />
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <AnalyticsCard
                    title="Session Revenue"
                    value={formatCurrency(analytics.sessionRevenue)}
                    icon={<DollarSign className="h-4 w-4" />}
                />
                <AnalyticsCard
                    title="Tickets Sold"
                    value={`${analytics.ticketsSold} / ${analytics.sessionCapacity}`}
                    icon={<Ticket className="h-4 w-4" />}
                />
                <AnalyticsCard
                    title="Sell-Out"
                    value={`${analytics.sellOutPercentage.toFixed(1)}%`}
                    icon={<Percent className="h-4 w-4" />}
                />
                <SeatStatusCard seatStatusBreakdown={analytics.seatStatusBreakdown} />
            </div>

            {/* Charts */}
            <div className="grid gap-8 lg:grid-cols-2">
                <TierSalesChart data={analytics.salesByTier} />
                <BlockOccupancyChart data={analytics.occupancyByBlock} />
            </div>
        </div>
    );
};
