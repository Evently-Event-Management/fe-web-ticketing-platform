"use client"

import React from "react";
import { DiscountDTO } from "@/types/event";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag, Calendar, Users, CircleDollarSign, Percent, DollarSign, Gift } from "lucide-react";
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
        case DiscountType.PERCENTAGE: return <Percent className="h-4 w-4" />;
        case DiscountType.FLAT_OFF: return <DollarSign className="h-4 w-4" />;
        case DiscountType.BUY_N_GET_N_FREE: return <Gift className="h-4 w-4" />;
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
    return date.toLocaleDateString("en-LK", { day: "numeric", month: "short" });
};

// --- Main Component ---
export const DiscountDisplayCard = ({ discount, onApply, isApplied = false }: DiscountDisplayCardProps) => {
    const expiryDate = formatDate(discount.expiresAt);

    // Helper to build a compact string of conditions
    const getConditions = (parameters: DiscountParameters) => {
        const conditions = [];
        if (parameters.type === "PERCENTAGE" || parameters.type === "FLAT_OFF") {
            if (parameters.minSpend) {
                conditions.push(`Min. spend ${formatCurrency(parameters.minSpend, 'LKR')}`);
            }
        }
        if (expiryDate) {
            conditions.push(`Expires ${expiryDate}`);
        }
        return conditions.join(' · ');
    };

    return (
        <div className={`flex items-center justify-between p-3 rounded-lg transition-all ${isApplied ? "bg-primary/10 border border-primary" : "border border-transparent hover:bg-muted/50"}`}>
            <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    {getDiscountIcon(discount.parameters.type)}
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{getDiscountValue(discount.parameters)}</span>
                        <Badge variant="secondary">{discount.code}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{getConditions(discount.parameters)}</p>
                </div>
            </div>
            <Button
                size="sm"
                variant={isApplied ? "secondary" : "default"}
                onClick={() => onApply(discount)}
                disabled={isApplied}
            >
                {isApplied ? "Applied" : "Apply"}
            </Button>
        </div>
    );
};