import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {CalendarDays, MapPin, Tag, Clock, Users} from "lucide-react";
import {cn, formatCurrency} from "@/lib/utils";
import {DiscountType} from "@/types/enums/discountType";
import {DiscountThumbnailDTO, EventThumbnailDTO} from "@/types/event";
import Image from "next/image";
import {AspectRatio} from "@/components/ui/aspect-ratio";
import Link from "next/link";
import {Suspense} from "react";
import {EventCardClientControls} from "./EventCardClientControls";

interface EventCardProps {
    event: EventThumbnailDTO
    className?: string
}

export function EventCard({ event, className }: EventCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        })
    }

    const getBestDiscount = () => {
        if (!event.discounts || event.discounts.length === 0) return null

        const now = new Date();
        const activeDiscounts = event.discounts.filter((discount) => {
            if (discount.expiresAt && new Date(discount.expiresAt) < now) return false;
            return !(discount.maxUsage && discount.currentUsage && discount.currentUsage >= discount.maxUsage);

        });

        if (activeDiscounts.length === 0) return null

        // Prioritize BOGO, then percentage, then flat off
        const priority = {
            [DiscountType.BUY_N_GET_N_FREE]: 0,
            [DiscountType.PERCENTAGE]: 1,
            [DiscountType.FLAT_OFF]: 2,
        };

        return activeDiscounts.sort((a, b) => {
            const aPriority = priority[a.parameters.type] ?? 99;
            const bPriority = priority[b.parameters.type] ?? 99;
            return aPriority - bPriority;
        })[0];
    }

    const getTimeRemaining = (expiryDate: string) => {
        const now = new Date();
        const end = new Date(expiryDate);
        const diff = end.getTime() - now.getTime();

        if (diff <= 0) return "Offer has expired";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days > 1) return `Ends in ${days} days`;
        if (days === 1) return `Ends in 1 day`;

        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) return `Ends in ${hours}h ${minutes}m`;

        return `Ends in ${minutes}m`;
    }

    const renderDiscountBadgeText = (discount: DiscountThumbnailDTO) => {
        switch (discount.parameters.type) {
            case DiscountType.PERCENTAGE:
                return `${discount.parameters.percentage}% OFF`
            case DiscountType.FLAT_OFF:
                // Assuming USD, replace with dynamic currency if needed
                return `$${discount.parameters.amount} OFF`
            case DiscountType.BUY_N_GET_N_FREE:
                return `BOGO Offer`
            default:
                return "Special Offer"
        }
    }

    const bestDiscount = getBestDiscount();

    return (
        <>
        <Link href={`/events/${event.id}`} className="block">
            <Card
                className={cn(
                    "group overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl shadow-lg flex flex-col h-full pt-0 gap-2",
                    className,
                )}
            >
                <CardHeader className={'m-0 p-0'}>
                    <AspectRatio ratio={16 / 9} className="relative overflow-hidden">
                        <Image
                            fill
                            src={event.coverPhotoUrl || "/placeholder.svg"}
                            alt={event.title}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        />
                        <Suspense fallback={(
                            <div className="absolute top-3 right-3 flex gap-2">
                                <div className="h-9 w-9 rounded-full bg-background/60 backdrop-blur-sm border border-border/30"/>
                                <div className="h-9 w-9 rounded-full bg-background/60 backdrop-blur-sm border border-border/30"/>
                            </div>
                        )}>
                            <EventCardClientControls event={event} />
                        </Suspense>
                        <div className="absolute top-3 left-3">
                            <Badge variant="secondary" className="bg-background/80 text-foreground backdrop-blur-sm">
                                {event.categoryName}
                            </Badge>
                        </div>
                    </AspectRatio>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow space-y-3 sm:space-y-4 px-4 sm:px-6 py-3 sm:py-4">
                    <div className="space-y-1 sm:space-y-1.5 flex-grow">
                        <p className="text-xs sm:text-sm text-muted-foreground font-medium">{event.organizationName}</p>
                        <h3 className="font-bold text-lg sm:text-xl leading-tight text-balance group-hover:text-primary transition-colors">
                            {event.title}
                        </h3>
                    </div>

                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                            <CalendarDays className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                            <span className="font-medium text-foreground truncate">
                                {formatDate(event.earliestSession.startTime)} at {formatTime(event.earliestSession.startTime)}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                            <MapPin className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                            <span className="truncate">
                                {event.earliestSession.venueName}, {event.earliestSession.city}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-end justify-between pt-2 border-t mt-auto">
                        <div>
                            <p className="text-xs text-muted-foreground">Starts from</p>
                            <p className="text-xl sm:text-2xl font-extrabold text-foreground leading-none">
                                {formatCurrency(event.startingPrice || 0, "LKR", "en-LK")}
                            </p>
                        </div>

                        {bestDiscount && (
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold cursor-help dark:bg-emerald-600 dark:hover:bg-emerald-700">
                                            <Tag className="w-2.5 sm:w-3 h-2.5 sm:h-3 mr-1 sm:mr-1.5" />
                                            {renderDiscountBadgeText(bestDiscount)}
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <div className="space-y-2 p-1 text-xs sm:text-sm">
                                            {bestDiscount.expiresAt && (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3 sm:w-4 h-3 sm:h-4" />
                                                    <span>{getTimeRemaining(bestDiscount.expiresAt)}</span>
                                                </div>
                                            )}
                                            {bestDiscount.maxUsage && (
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-3 sm:w-4 h-3 sm:h-4" />
                                                    <span>
                                                        {bestDiscount.maxUsage - (bestDiscount.currentUsage || 0)} left
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
        </>
    )
}