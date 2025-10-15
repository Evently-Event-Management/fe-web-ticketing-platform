'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CalendarIcon, Clock, MapPin, Ticket, Video } from "lucide-react";
import {
    SessionInfoBasicDTO,
    SessionSeatingMapDTO
} from "@/types/event";
import { Button } from "@/components/ui/button";
import { SessionMap } from "@/app/(home-app)/events/[event_id]/_components/SessionMap";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SeatingLayoutPreview } from "@/app/(home-app)/events/[event_id]/_components/SeatingLayoutPreview";
import { useState } from "react";
import { getSessionSeatingMap } from "@/lib/actions/public/SessionActions";
import { SeatStatusSummary } from "@/app/(home-app)/events/[event_id]/_components/SeatStatusSummery";
import { useRouter } from "next/navigation";
import { SessionStatusBadge } from "@/components/SessionStatusBadge";
import { SessionType } from "@/types/enums/sessionType";
import { SessionStatus } from "@/types/enums/sessionStatus";
import { DiscountParameters } from "@/lib/validators/event";
import { DiscountType } from "@/types/enums/discountType";
import { Badge } from "@/components/ui/badge";
import { SessionSubscribeButton } from "@/components/SessionSubscribeButton";

// --- Helper Functions & Constants for Discounts ---

const accentColorClasses: Record<string, { bg: string; text: string; }> = {
    [DiscountType.PERCENTAGE]: {
        bg: "bg-orange-100 dark:bg-orange-900/20",
        text: "text-orange-600 dark:text-orange-400"
    },
    [DiscountType.FLAT_OFF]: { bg: "bg-green-100 dark:bg-green-900/20", text: "text-green-600 dark:text-green-400" },
    [DiscountType.BUY_N_GET_N_FREE]: { bg: "bg-blue-100 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400" },
};

// A simple currency formatter. You can replace this with your project's `formatCurrency` util.
const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
};

const getDiscountTitle = (parameters: DiscountParameters) => {
    switch (parameters.type) {
        case DiscountType.PERCENTAGE:
            return `${parameters.percentage}% OFF`;
        case DiscountType.FLAT_OFF:
            return `${formatCurrency(parameters.amount, parameters.currency)} OFF`;
        case DiscountType.BUY_N_GET_N_FREE:
            return `Buy ${parameters.buyQuantity} Get ${parameters.getQuantity}`;
    }
};


export const SessionItem = ({ session }: { session: SessionInfoBasicDTO }) => {
    const [seatingMap, setSeatingMap] = useState<SessionSeatingMapDTO | null>(null);
    const [isMapLoading, setIsMapLoading] = useState(false);
    const router = useRouter();

    const onOpen = (isOpen: boolean) => {
        if (isOpen && !seatingMap && session.sessionType === SessionType.PHYSICAL) {
            setIsMapLoading(true);
            getSessionSeatingMap(session.id)
                .then(data => setSeatingMap(data))
                .catch(err => console.error("Failed to fetch seating map", err))
                .finally(() => setIsMapLoading(false));
        }
    };

    const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-LK", {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const formatTime = (iso: string) => new Date(iso).toLocaleTimeString("en-LK", {
        hour: '2-digit', minute: '2-digit', hour12: true
    });

    const formatSalesStartTime = (iso: string) => {
        const salesStartDate = new Date(iso);
        const now = new Date();

        if (salesStartDate.toDateString() === now.toDateString()) {
            return `Sales start today at ${formatTime(iso)}`;
        }

        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);
        if (salesStartDate.toDateString() === tomorrow.toDateString()) {
            return `Sales start tomorrow at ${formatTime(iso)}`;
        }

        return `Sales start on ${formatDate(iso)} at ${formatTime(iso)}`;
    };

    return (
        <Card className="mb-4 shadow-sm">
            <CardHeader>
                <div className="flex flex-wrap justify-between items-center w-full gap-2 mb-2">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                        <span className="font-semibold text-foreground">{formatDate(session.startTime)}</span>
                        <SessionStatusBadge status={session.status} />
                    </div>
                    <div className="flex items-center gap-2">
                        {session.status === SessionStatus.SCHEDULED && session.salesStartTime && (
                            <span className="text-sm text-muted-foreground italic">
                                {formatSalesStartTime(session.salesStartTime)}
                            </span>
                        )}
                        {(session.status === SessionStatus.ON_SALE || session.status === SessionStatus.SCHEDULED) && (
                            <SessionSubscribeButton
                                sessionId={session.id}
                                sessionTitle={`Session on ${formatDate(session.startTime)}`}
                                variant="outline"
                            />
                        )}
                        {session.status === SessionStatus.ON_SALE &&
                            <Button onClick={() => router.push(`${window.location.pathname}/${session.id}`)}>
                                Buy Tickets
                            </Button>
                        }
                    </div>
                </div>
                <div className={"gap-2 flex flex-col"}>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>
                            {session.venueDetails.name} - {session.sessionType === SessionType.PHYSICAL ? session.venueDetails.address :
                                <a href={session.venueDetails.onlineLink} target="_blank" rel="noreferrer"
                                    className="text-primary underline hover:text-primary/80">Online Link</a>}
                        </span>
                    </div>

                    {/* ✅ ADDED: Discount Display Section */}
                    {session.discounts && session.discounts.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Ticket className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="flex flex-wrap gap-2">
                                {session.discounts.map((discount, index) => {
                                    const colors = accentColorClasses[discount.parameters.type];
                                    return (
                                        <Badge key={index} variant="secondary"
                                            className={`font-normal ${colors.bg} ${colors.text}`}>
                                            {getDiscountTitle(discount.parameters)}
                                        </Badge>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible onValueChange={(value) => onOpen(!!value)}>
                    <AccordionItem value={session.id} className="border-b-0">
                        <AccordionTrigger>
                            <div className="font-medium text-foreground">View Details</div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                            {session.sessionType === SessionType.PHYSICAL ? (
                                <div className="min-h-[450px] w-full rounded-lg border p-4">
                                    {isMapLoading ? (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                                            <div className="md:col-span-1 flex flex-col gap-4">
                                                <Skeleton className="h-48 w-full" />
                                                <Skeleton className="flex-grow w-full" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <Skeleton className="h-full w-full" />
                                            </div>
                                        </div>
                                    ) : seatingMap ? (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                                            <div className="md:col-span-1 flex flex-col gap-4">
                                                <SeatStatusSummary seatingMap={seatingMap} />
                                                {session.venueDetails.location && (
                                                    <div className="flex-grow h-full">
                                                        <SessionMap location={session.venueDetails.location} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="md:col-span-2">
                                                <SeatingLayoutPreview seatingMap={seatingMap} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="h-full flex items-center justify-center text-center text-sm text-muted-foreground">
                                            Session details will be loaded here.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Card className="bg-muted/50">
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <Video className="h-6 w-6 text-primary" />
                                            <h3 className="text-lg font-semibold text-foreground">Online Session</h3>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">This is an online session. Access details
                                            will be provided after purchasing a ticket. Please use the link in the
                                            header to join.</p>
                                    </CardContent>
                                </Card>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
};