import { EventAnalytics } from "@/types/eventAnalytics";
import { AnalyticsCard } from "./AnalyticsCard";
import { DollarSign, Ticket, Percent, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { TierSalesChart } from "./TierSalesChart";

export const EventAnalyticsView: React.FC<{ analytics: EventAnalytics }> = ({ analytics }) => {
    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <AnalyticsCard
                    title="Total Revenue"
                    value={formatCurrency(analytics.totalRevenue, 'LKR', 'en-LK')}
                    subtitle="Across all sessions"
                    icon={<DollarSign className="h-4 w-4" />}
                />
                <AnalyticsCard
                    title="Tickets Sold"
                    value={analytics.totalTicketsSold.toLocaleString()}
                    subtitle={`out of ${analytics.totalEventCapacity.toLocaleString()}`}
                    icon={<Ticket className="h-4 w-4" />}
                />
                <AnalyticsCard
                    title="Overall Sell-Out"
                    value={`${analytics.overallSellOutPercentage.toFixed(1)}%`}
                    subtitle="Average capacity filled"
                    icon={<Percent className="h-4 w-4" />}
                />
                <AnalyticsCard
                    title="Avg. Revenue / Ticket"
                    value={formatCurrency(analytics.averageRevenuePerTicket, 'LKR', 'en-LK')}
                    subtitle="Average ticket price"
                    icon={<Users className="h-4 w-4" />}
                />
            </div>
            <div className="grid gap-8">
                <TierSalesChart data={analytics.salesByTier} />
            </div>
        </div>
    );
};