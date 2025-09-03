import { SessionAnalytics } from "@/types/eventAnalytics";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AnalyticsCard } from "./AnalyticsCard";
import { ArrowLeft, DollarSign, Percent, Ticket } from "lucide-react";
import { TierSalesChart } from "./TierSalesChart";
import { BlockOccupancyChart } from "./BlockOccupancyChart";
import { SessionStatusBadge } from "@/components/SessionStatusBadge";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

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
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Seat Status</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="space-y-1 pt-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Booked</span>
                            <span className="font-medium">{(analytics.seatStatusBreakdown.BOOKED || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Available</span>
                            <span className="font-medium">{(analytics.seatStatusBreakdown.AVAILABLE || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Locked</span>
                            <span className="font-medium">{(analytics.seatStatusBreakdown.LOCKED || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Reserved</span>
                            <span className="font-medium">{(analytics.seatStatusBreakdown.RESERVED || 0).toLocaleString()}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-8 lg:grid-cols-2">
                <TierSalesChart data={analytics.salesByTier} />
                <BlockOccupancyChart data={analytics.occupancyByBlock} />
            </div>
        </div>
    );
};

