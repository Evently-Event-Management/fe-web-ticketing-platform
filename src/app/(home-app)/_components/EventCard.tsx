import {Card, CardContent, CardHeader} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {CalendarDays, MapPin, Tag, Share2, Bookmark} from "lucide-react"
import {cn, formatCurrency} from "@/lib/utils"
import {DiscountType} from "@/types/enums/discountType";
import {DiscountThumbnailDTO, EventThumbnailDTO} from "@/types/event";
import Image from "next/image";
import {AspectRatio} from "@/components/ui/aspect-ratio";

interface EventCardProps {
    event: EventThumbnailDTO
    className?: string
}

export function EventCard({event, className}: EventCardProps) {
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

        // Find the best active discount
        const activeDiscounts = event.discounts.filter((discount) => {
            if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) return false
            if (discount.maxUsage && discount.currentUsage && discount.currentUsage >= discount.maxUsage) return false
            return true
        })

        if (activeDiscounts.length === 0) return null

        // Prioritize percentage discounts, then flat off, then BOGO
        const sortedDiscounts = activeDiscounts.sort((a, b) => {
            if (a.parameters.type === DiscountType.PERCENTAGE && b.parameters.type !== DiscountType.PERCENTAGE) return -1
            if (b.parameters.type === DiscountType.PERCENTAGE && a.parameters.type !== DiscountType.PERCENTAGE) return 1
            return 0
        })

        return sortedDiscounts[0]
    }

    const getTimeRemaining = (expiryDate: string) => {
        const now = new Date()
        const end = new Date(expiryDate)
        const diff = end.getTime() - now.getTime()

        if (diff <= 0) return "Expired"

        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

        if (days > 1) return `Ends in ${days} days`
        if (days === 1) return `Ends in 1 day`
        if (hours > 0) return `Ends in ${hours}h ${minutes}m`
        return `Ends in ${minutes}m`
    }

    const renderDiscountBadge = (discount: DiscountThumbnailDTO) => {
        switch (discount.parameters.type) {
            case DiscountType.PERCENTAGE:
                return `${discount.parameters.percentage}% OFF`
            case DiscountType.FLAT_OFF:
                return `$${discount.parameters.amount} OFF`
            case DiscountType.BUY_N_GET_N_FREE:
                return `Buy ${discount.parameters.buyQuantity} Get ${discount.parameters.getQuantity} FREE`
            default:
                return "Special Offer"
        }
    }

    const bestDiscount = getBestDiscount()

    return (
        <Card
            className={cn(
                "group overflow-hidden hover:bg-accent/50 transition-all duration-300 hover:scale-[1.01] cursor-pointer shadow-lg hover:shadow-2xl pt-0",
                className,
            )}
        >
            <CardHeader className={'m-0 p-0'}>
                <AspectRatio ratio={16 / 9} className="relative overflow-hidden">
                    <Image
                        fill
                        src={event.coverPhotoUrl || "/placeholder.svg"}
                        alt={event.title}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/6366f1/ffffff?text=Event+Image';
                        }}
                    />
                    {bestDiscount && (
                        <div
                            className="absolute bottom-0 left-0 bg-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-tr-2xl flex items-center gap-2 shadow-md">
                            <Tag className="w-4 h-4"/>
                            <span>{renderDiscountBadge(bestDiscount)}</span>
                        </div>
                    )}

                    <div className="absolute top-3 right-3 flex gap-2">
                        <Button
                            size="sm"
                            variant="secondary"
                            className="bg-background/90 text-foreground backdrop-blur-sm hover:bg-background/95 p-2 h-8 w-8"
                        >
                            <Share2 className="w-4 h-4"/>
                        </Button>
                        <Button
                            size="sm"
                            variant="secondary"
                            className="bg-background/90 text-foreground backdrop-blur-sm hover:bg-background/95 p-2 h-8 w-8"
                        >
                            <Bookmark className="w-4 h-4"/>
                        </Button>
                    </div>

                    {/* Category badge moved to top-left */}
                    <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="bg-background/90 text-foreground backdrop-blur-sm">
                            {event.categoryName}
                        </Badge>
                    </div>
                </AspectRatio>

            </CardHeader>
            <CardContent className="space-y-4">
                {/* Title and Organization */}
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium">{event.organizationName}</p>
                    <h3 className="font-bold text-xl leading-tight text-balance group-hover:text-primary transition-colors">
                        {event.title}
                    </h3>
                </div>

                {/* Event Details */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="w-4 h-4"/>
                        <span className="font-medium text-foreground">
              {formatDate(event.earliestSession.startTime)} at {formatTime(event.earliestSession.startTime)}
            </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4"/>
                        <span>
              {event.earliestSession.venueName}, {event.earliestSession.city}
            </span>
                    </div>
                </div>

                {/* Price and CTA */}
                <div className="flex items-center justify-between pt-2">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Starting from</p>
                        <p className="text-2xl font-extrabold text-foreground">{formatCurrency(event.startingPrice || 0, "LKR", "en-LK")}</p>
                    </div>

                    <Button
                        size="sm"
                    >
                        Details
                    </Button>
                </div>

                {bestDiscount && bestDiscount.expiresAt && (
                    <div className="pt-4 border-t border-border/50 text-center">
                        <p className="text-xs font-semibold text-destructive animate-pulse">
                            {getTimeRemaining(bestDiscount.expiresAt)}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
