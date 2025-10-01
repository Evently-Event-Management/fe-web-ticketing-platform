"use client"

import { DiscountDTO } from "@/types/event";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, CircleDollarSign, Percent, DollarSign, Gift } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {DiscountType} from "@/types/enums/discountType";
import {DiscountParameters} from "@/lib/validators/event";

// --- Component Props ---
interface DiscountDisplayCardProps {
    discount: DiscountDTO;
    onApply: (discount: DiscountDTO) => void;
    isApplied?: boolean;
}

// --- Helper Functions ---

const getDiscountIcon = (type: DiscountType) => {
    switch (type) {
        case DiscountType.PERCENTAGE: return <Percent className="h-5 w-5" />;
        case DiscountType.FLAT_OFF: return <DollarSign className="h-5 w-5" />;
        case DiscountType.BUY_N_GET_N_FREE: return <Gift className="h-5 w-5" />;
    }
};

const getAccentColor = (type: DiscountType) => {
    switch (type) {
        case DiscountType.PERCENTAGE: return "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20";
        case DiscountType.FLAT_OFF: return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20";
        case DiscountType.BUY_N_GET_N_FREE: return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20";
    }
};

const getDiscountValue = (parameters: DiscountParameters) => {
    switch (parameters.type) {
        case DiscountType.PERCENTAGE: return `${parameters.percentage}% OFF`;
        case DiscountType.FLAT_OFF: return `${formatCurrency(parameters.amount, parameters.currency)} OFF`;
        case DiscountType.BUY_N_GET_N_FREE: return `Buy ${parameters.buyQuantity}, Get ${parameters.getQuantity} Free`;
    }
};

const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" });
};

export const DiscountDisplayCard = ({ discount, onApply, isApplied = false }: DiscountDisplayCardProps) => {
    const accentColor = getAccentColor(discount.parameters.type);
    const expiryDate = formatDate(discount.expiresAt);

    // Helper function to render type-specific conditions
    const renderConditions = (parameters: DiscountParameters) => {
        switch (parameters.type) {
            case DiscountType.PERCENTAGE:
                return (
                    <>
                        {parameters.minSpend && (
                            <li className="flex items-center gap-2">
                                <CircleDollarSign className="h-4 w-4 text-primary" />
                                <span>Minimum spend of {formatCurrency(parameters.minSpend, 'LKR')}</span>
                            </li>
                        )}
                        {parameters.maxDiscount && (
                            <li className="flex items-center gap-2">
                                <Percent className="h-4 w-4 text-primary" />
                                <span>Maximum discount of {formatCurrency(parameters.maxDiscount, 'LKR')}</span>
                            </li>
                        )}
                    </>
                );
            case DiscountType.FLAT_OFF:
                return (
                    <>
                        {parameters.minSpend && (
                            <li className="flex items-center gap-2">
                                <CircleDollarSign className="h-4 w-4 text-primary" />
                                <span>Minimum spend of {formatCurrency(parameters.minSpend, 'LKR')}</span>
                            </li>
                        )}
                    </>
                );
            case DiscountType.BUY_N_GET_N_FREE:
                return null;
        }
    };

    return (
        <Card className={`transition-all ${isApplied ? "border-primary shadow-lg" : "border-border/40"}`}>
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${accentColor}`}>
                        {getDiscountIcon(discount.parameters.type)}
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-lg">
                            {getDiscountValue(discount.parameters)}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                            Code: <Badge variant="outline">{discount.code}</Badge>
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3 text-sm text-muted-foreground pb-4">
                <ul className="space-y-2">
                    {/* Render type-specific conditions */}
                    {renderConditions(discount.parameters)}

                    {expiryDate && (
                        <li className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span>Expires on {expiryDate}</span>
                        </li>
                    )}
                    {discount.maxUsage != null && (
                        <li className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            <span>{discount.maxUsage - (discount.currentUsage || 0)} of {discount.maxUsage} remaining</span>
                        </li>
                    )}
                </ul>
            </CardContent>

            <CardFooter>
                <Button
                    className="w-full"
                    variant={isApplied ? "secondary" : "default"}
                    onClick={() => onApply(discount)}
                    disabled={isApplied}
                >
                    {isApplied ? "Applied" : "Apply Discount"}
                </Button>
            </CardFooter>
        </Card>
    );
};