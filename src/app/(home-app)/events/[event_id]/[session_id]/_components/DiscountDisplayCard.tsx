"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Clock, Percent, Tag, Gift } from "lucide-react"
import {DiscountParameters} from "@/lib/validators/event";
import {DiscountDTO} from "@/types/event";

export interface DiscountDisplayCardProps {
    discount: DiscountDTO
    onApply: (discount: DiscountDTO) => void
    isApplied?: boolean
}


const discountTypeConfig = {
    PERCENTAGE: {
        color: "bg-blue-500",
        lightBg: "bg-blue-50",
        textColor: "text-blue-700",
        borderColor: "border-blue-200",
    },
    FLAT_OFF: {
        color: "bg-emerald-500",
        lightBg: "bg-emerald-50",
        textColor: "text-emerald-700",
        borderColor: "border-emerald-200",
    },
    BUY_N_GET_N_FREE: {
        color: "bg-purple-500",
        lightBg: "bg-purple-50",
        textColor: "text-purple-700",
        borderColor: "border-purple-200",
    },
}

const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toFixed(2)}`
}

const getDiscountHeading = (parameters: DiscountParameters) => {
    switch (parameters.type) {
        case "PERCENTAGE":
            return `${parameters.percentage}% OFF`
        case "FLAT_OFF":
            return `${formatCurrency(parameters.amount, parameters.currency)} OFF`
        case "BUY_N_GET_N_FREE":
            return `Buy ${parameters.buyQuantity} Get ${parameters.getQuantity} Free`
    }
}

const getDiscountDescription = (parameters: DiscountParameters) => {
    switch (parameters.type) {
        case "PERCENTAGE": {
            const parts = []
            if (parameters.minSpend) {
                parts.push(`on orders over ${formatCurrency(parameters.minSpend, "LKR")}`)
            }
            if (parameters.maxDiscount) {
                parts.push(`(up to ${formatCurrency(parameters.maxDiscount, "LKR")})`)
            }
            return parts.length > 0 ? parts.join(" ") : null
        }
        case "FLAT_OFF": {
            if (parameters.minSpend) {
                return `on orders over ${formatCurrency(parameters.minSpend, parameters.currency)}`
            }
            return null
        }
        case "BUY_N_GET_N_FREE":
            return null
    }
}

export function DiscountDisplayCard({ discount, onApply, isApplied = false }: DiscountDisplayCardProps) {
    const isExpired = discount.expiresAt ? new Date(discount.expiresAt) < new Date() : false
    const isMaxedOut =
        discount.maxUsage !== null && discount.currentUsage !== null && discount.currentUsage >= discount.maxUsage
    const isAvailable = discount.active && !isExpired && !isMaxedOut

    const colorConfig = discountTypeConfig[discount.parameters.type]

    const getDiscountIcon = () => {
        switch (discount.parameters.type) {
            case "PERCENTAGE":
                return <Percent className="h-5 w-5" />
            case "FLAT_OFF":
                return <Tag className="h-5 w-5" />
            case "BUY_N_GET_N_FREE":
                return <Gift className="h-5 w-5" />
            default:
                return <Tag className="h-5 w-5" />
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    return (
        <Card className={`relative overflow-hidden border-2 ${isAvailable ? colorConfig.borderColor : "border-muted"}`}>
            <div
                className={`absolute left-0 top-0 h-full w-1.5 ${
                    isApplied ? "bg-green-500" : isAvailable ? colorConfig.color : "bg-muted-foreground"
                }`}
            />

            <CardHeader className="pb-3 pl-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div
                            className={`mt-1 rounded-lg p-2 ${
                                isAvailable ? `${colorConfig.lightBg} ${colorConfig.textColor}` : "bg-muted text-muted-foreground"
                            }`}
                        >
                            {getDiscountIcon()}
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold text-lg leading-none">{getDiscountHeading(discount.parameters)}</h3>
                            {getDiscountDescription(discount.parameters) && (
                                <p className="text-muted-foreground text-sm">{getDiscountDescription(discount.parameters)}</p>
                            )}
                            <div className="flex items-center gap-2">
                                <code className="rounded bg-muted px-2 py-1 font-mono text-sm">{discount.code}</code>
                                {isApplied && (
                                    <Badge variant="secondary" className="gap-1">
                                        <Check className="h-3 w-3" />
                                        Applied
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {!isAvailable && (
                        <Badge variant="destructive" className="shrink-0">
                            {isExpired ? "Expired" : isMaxedOut ? "Maxed Out" : "Inactive"}
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-3 pl-6">
                <div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
                    {discount.expiresAt && (
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            <span>Expires {formatDate(discount.expiresAt)}</span>
                        </div>
                    )}
                    {discount.maxUsage !== null && discount.currentUsage !== null && (
                        <div className="flex items-center gap-1.5">
              <span>
                {discount.currentUsage} / {discount.maxUsage} used
              </span>
                        </div>
                    )}
                </div>

                {discount.applicableTiers && discount.applicableTiers.length > 0 && (
                    <div className="space-y-2">
                        <p className="font-medium text-sm">Applicable to:</p>
                        <div className="flex flex-wrap gap-2">
                            {discount.applicableTiers.map((tier) => (
                                <Badge
                                    key={tier.id}
                                    variant="outline"
                                    style={{
                                        borderColor: tier.color,
                                        color: tier.color,
                                    }}
                                >
                                    {tier.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter className="pl-6">
                <Button
                    onClick={() => onApply(discount)}
                    disabled={!isAvailable || isApplied}
                    className={`w-full ${isAvailable && !isApplied ? colorConfig.color : ""}`}
                    variant={isApplied ? "secondary" : "default"}
                >
                    {isApplied ? "Applied" : "Apply Discount"}
                </Button>
            </CardFooter>
        </Card>
    )
}
