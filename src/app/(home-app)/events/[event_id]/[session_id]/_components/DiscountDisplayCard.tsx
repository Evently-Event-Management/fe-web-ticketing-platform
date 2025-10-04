"use client"

import React from "react"
import {Card, CardContent, CardFooter} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {Check, Clock, Percent, Gift, XCircle, DollarSign, Sparkles} from "lucide-react"
import {formatCurrency} from "@/lib/utils"
import {DiscountParameters} from "@/lib/validators/event"
import {DiscountType} from "@/types/enums/discountType"
import {DiscountDTO} from "@/types/event"

// --- Component Props ---
export interface DiscountDisplayCardProps {
    discount: DiscountDTO
    onApply: (discount: DiscountDTO) => void
    isApplied?: boolean
    isManuallyLoaded?: boolean
}

// --- Helper Functions ---
const getDiscountIcon = (type: DiscountType) => {
    switch (type) {
        case "PERCENTAGE":
            return <Percent className="h-5 w-5"/>
        case "FLAT_OFF":
            return <DollarSign className="h-5 w-5"/>
        case "BUY_N_GET_N_FREE":
            return <Gift className="h-5 w-5"/>
    }
}

const accentColorClasses: Record<
    string,
    { bg: string; text: string; button: string; border: string; badgeBg: string; badgeText: string; pulseColor: string }
> = {
    [DiscountType.PERCENTAGE]: {
        bg: "bg-orange-100 dark:bg-orange-900/20",
        text: "text-orange-600 dark:text-orange-400",
        button: "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500",
        border: "border-orange-300 dark:border-orange-700",
        badgeBg: "bg-orange-100 dark:bg-orange-900/30",
        badgeText: "text-orange-700 dark:text-orange-400",
        pulseColor: "bg-orange-500/10",
    },
    [DiscountType.FLAT_OFF]: {
        bg: "bg-green-100 dark:bg-green-900/20",
        text: "text-green-600 dark:text-green-400",
        button: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
        border: "border-green-300 dark:border-green-700",
        badgeBg: "bg-green-100 dark:bg-green-900/30",
        badgeText: "text-green-700 dark:text-green-400",
        pulseColor: "bg-green-500/10",
    },
    [DiscountType.BUY_N_GET_N_FREE]: {
        bg: "bg-blue-100 dark:bg-blue-900/20",
        text: "text-blue-600 dark:text-blue-400",
        button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
        border: "border-blue-300 dark:border-blue-700",
        badgeBg: "bg-blue-100 dark:bg-blue-900/30",
        badgeText: "text-blue-700 dark:text-blue-400",
        pulseColor: "bg-blue-500/10",
    },
}

const getDiscountHeading = (parameters: DiscountParameters) => {
    switch (parameters.type) {
        case "PERCENTAGE":
            return `${parameters.percentage}% OFF`
        case "FLAT_OFF":
            return `${formatCurrency(parameters.amount, parameters.currency)} OFF`
        case "BUY_N_GET_N_FREE":
            return `Buy ${parameters.buyQuantity}, Get ${parameters.getQuantity} Free`
    }
}

const getDiscountDescription = (parameters: DiscountParameters) => {
    switch (parameters.type) {
        case "PERCENTAGE": {
            const parts = []
            if (parameters.minSpend)
                parts.push(
                    `on orders over ${formatCurrency(parameters.minSpend, "LKR")}`
                )
            if (parameters.maxDiscount)
                parts.push(
                    `(up to ${formatCurrency(parameters.maxDiscount, "LKR")})`
                )
            return parts.length > 0 ? parts.join(" ") : null
        }
        case "FLAT_OFF": {
            if (parameters.minSpend)
                return `on orders over ${formatCurrency(
                    parameters.minSpend,
                    parameters.currency
                )}`
            return null
        }
        case "BUY_N_GET_N_FREE":
            return null
    }
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-LK", {
        month: "short",
        day: "numeric",
    })
}

// --- Main Component ---
export function DiscountDisplayCard({
                                        discount,
                                        onApply,
                                        isApplied = false,
                                        isManuallyLoaded = false,
                                    }: DiscountDisplayCardProps) {
    const isExpired = discount.expiresAt
        ? new Date(discount.expiresAt) < new Date()
        : false
    const isMaxedOut =
        discount.maxUsage !== null &&
        discount.currentUsage !== null &&
        discount.currentUsage >= discount.maxUsage
    const isAvailable = discount.active && !isExpired && !isMaxedOut

    const colors = accentColorClasses[discount.parameters.type]

    const getStatusBadge = () => {
        if (isApplied)
            return (
                <Badge variant="secondary" className="gap-1.5">
                    <Check className="h-3 w-3"/>
                    Applied
                </Badge>
            )
        if (isManuallyLoaded)
            return (
                <Badge
                    variant="outline"
                    className={`${colors.badgeBg} ${colors.badgeText} gap-1.5 ${colors.border}`}
                >
                    <Sparkles className="h-3 w-3"/>
                    Exclusive
                </Badge>
            )
        if (isAvailable)
            return (
                <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1.5"
                >
                    <Check className="h-3 w-3"/>
                    Available
                </Badge>
            )
        return (
            <Badge variant="destructive" className="gap-1.5">
                <XCircle className="h-3 w-3"/>
                {isExpired ? "Expired" : isMaxedOut ? "Fully Used" : "Inactive"}
            </Badge>
        )
    }

    const manuallyLoadedStyles = isManuallyLoaded ? {
        borderColor: colors.border,
        bgGradient: `bg-gradient-to-r from-${discount.parameters.type === 'PERCENTAGE' ? 'orange' : discount.parameters.type === 'FLAT_OFF' ? 'green' : 'blue'}-50 to-transparent dark:from-${discount.parameters.type === 'PERCENTAGE' ? 'orange' : discount.parameters.type === 'FLAT_OFF' ? 'green' : 'blue'}-900/10 dark:to-transparent`,
    } : {};

    // Use a simpler gradient approach to avoid Tailwind class generation issues
    const getGradientClass = () => {
        if (!isManuallyLoaded) return "";

        switch(discount.parameters.type) {
            case 'PERCENTAGE':
                return "bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-900/10 dark:to-transparent";
            case 'FLAT_OFF':
                return "bg-gradient-to-r from-green-50 to-transparent dark:from-green-900/10 dark:to-transparent";
            case 'BUY_N_GET_N_FREE':
                return "bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/10 dark:to-transparent";
            default:
                return "";
        }
    };

    return (
        <Card
            className={`relative flex flex-row items-center justify-between p-4 gap-6 overflow-hidden border-2 ${
                isApplied
                    ? "border-green-500"
                    : isManuallyLoaded
                        ? manuallyLoadedStyles.borderColor
                        : isAvailable
                            ? "border-transparent"
                            : "border-muted/50 opacity-70"
            } ${isManuallyLoaded ? getGradientClass() : ""}`}
        >
            {isManuallyLoaded && (
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 h-16 w-16 -translate-y-8 translate-x-8">
                        <div className={`h-full w-full ${colors.pulseColor} rounded-full animate-pulse`} style={{ animationDuration: '3s' }}></div>
                    </div>
                </div>
            )}

            {/* Left Section: Icon */}
            <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${colors.bg} ${colors.text} flex-shrink-0`}
            >
                {getDiscountIcon(discount.parameters.type)}
            </div>

            {/* Middle Section: Details */}
            <CardContent className="flex-1 p-0">
                <div className="flex items-center gap-4">
                    <h3 className="font-semibold text-lg leading-none">
                        {getDiscountHeading(discount.parameters)}
                    </h3>
                    {getStatusBadge()}
                </div>
                <p className="text-muted-foreground text-sm font-mono">
                    {discount.code}
                </p>

                {getDiscountDescription(discount.parameters) && (
                    <p className="text-muted-foreground text-sm mt-1">
                        {getDiscountDescription(discount.parameters)}
                    </p>
                )}

                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {discount.expiresAt && (
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3"/>
                            <span>Expires {formatDate(discount.expiresAt)}</span>
                        </div>
                    )}
                    {discount.applicableTiers &&
                        discount.applicableTiers.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {discount.applicableTiers.map((tier) => (
                                    <Badge
                                        key={tier.id}
                                        variant="outline"
                                        className="font-normal text-xs"
                                        style={{
                                            borderColor: tier.color,
                                            color: tier.color,
                                        }}
                                    >
                                        {tier.name}
                                    </Badge>
                                ))}
                            </div>
                        )}
                </div>
            </CardContent>

            {/* Right Section: Buttons */}
            <CardFooter className="p-0 gap-2">
                <Button
                    onClick={() => onApply(discount)}
                    disabled={!isAvailable || isApplied}
                    className={`font-semibold whitespace-nowrap ${
                        isAvailable && !isApplied ? colors.button : ""
                    }`}
                    variant={isApplied ? "secondary" : "default"}
                >
                    {isApplied ? "Applied" : "Apply"}
                </Button>
            </CardFooter>
        </Card>
    )
}
