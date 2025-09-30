"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type DiscountThumbnailDTO } from "@/types/event" // Adjust this import path
import { Percent, DollarSign, Gift, Calendar, Users } from "lucide-react"
import {formatCurrency} from "@/lib/utils"
import {DiscountType} from "@/types/enums/discountType";
import {getDiscountValue} from "@/lib/discountUtils"; // Adjust this import path

// --- Component Props ---
interface OfferCardProps {
    item: DiscountThumbnailDTO
}

// --- Helper Functions for Display Logic ---

const getDiscountIcon = (type: DiscountType) => {
    switch (type) {
        case DiscountType.PERCENTAGE: return <Percent className="h-5 w-5" />
        case DiscountType.FLAT_OFF: return <DollarSign className="h-5 w-5" />
        case DiscountType.BUY_N_GET_N_FREE: return <Gift className="h-5 w-5" />
    }
}

const getDiscountTitle = (parameters: DiscountThumbnailDTO["parameters"]) => {
    switch (parameters.type) {
        case DiscountType.PERCENTAGE:
            return `${parameters.percentage}% OFF`
        case DiscountType.FLAT_OFF:
            return `${formatCurrency(parameters.amount, parameters.currency)} OFF`
        case DiscountType.BUY_N_GET_N_FREE:
            return `Buy ${parameters.buyQuantity}, Get ${parameters.getQuantity}`
    }
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-LK", { day: "numeric", month: "short" });
}

const isExpiringSoon = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffHours = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
    // Returns true if the discount expires in the next 48 hours
    return diffHours <= 48 && diffHours > 0;
}

// ✅ To prevent issues with Tailwind CSS purging dynamic classes, we use a map.
const accentColorClasses: Record<string, { bg: string; text: string; progress: string }> = {
    [DiscountType.PERCENTAGE]: { bg: "bg-orange-100 dark:bg-orange-900/20", text: "text-orange-600 dark:text-orange-400", progress: "bg-orange-500" },
    [DiscountType.FLAT_OFF]: { bg: "bg-green-100 dark:bg-green-900/20", text: "text-green-600 dark:text-green-400", progress: "bg-green-500" },
    [DiscountType.BUY_N_GET_N_FREE]: { bg: "bg-blue-100 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400", progress: "bg-blue-500" },
};

// --- Main Component ---

export function OfferCard({ item }: OfferCardProps) {
    const colors = accentColorClasses[item.parameters.type];
    const isExpiring = item.expiresAt && isExpiringSoon(item.expiresAt);

    return (
            <Card className="gap-4">
                {/* Header */}
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${colors.bg} ${colors.text}`}>
                            {getDiscountIcon(item.parameters.type)}
                        </div>
                        <CardTitle className={`text-xl font-bold ${colors.text}`}>
                            {getDiscountTitle(item.parameters)}
                        </CardTitle>
                    </div>
                </CardHeader>

                {/* Body */}
                <CardContent className="flex flex-col flex-grow space-y-4 text-sm">
                    <p className="text-muted-foreground flex-grow">
                        {getDiscountValue(item.parameters)}
                    </p>

                    {/* Expiry Badge */}
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {item.expiresAt ? (
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                isExpiring ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-muted/50 text-muted-foreground"
                            }`}>
                                {isExpiring ? "Expires soon!" : `Expires ${formatDate(item.expiresAt)}`}
                            </span>
                        ) : (
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                No expiry
                            </span>
                        )}
                    </div>

                    {/* Usage Progress */}
                    {item.maxUsage != null && (
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>Usage Limit</span>
                                </div>
                                <span>{item.currentUsage || 0} / {item.maxUsage} used</span>
                            </div>
                            <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                                <div
                                    className={`h-2 rounded-full ${colors.progress} transition-all duration-300`}
                                    style={{
                                        width: `${Math.min(((item.currentUsage || 0) / item.maxUsage) * 100, 100)}%`,
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
    );
}