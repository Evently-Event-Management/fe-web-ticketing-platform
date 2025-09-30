// components/ui/DiscountDisplayCard.tsx

"use client"

import { DiscountDTO } from "@/types/event";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";

import {getDiscountValue} from "@/lib/discountUtils";

interface DiscountDisplayCardProps {
    discount: DiscountDTO;
    onApply: (discount: DiscountDTO) => void;
    isApplied?: boolean;
}

export const DiscountDisplayCard = ({ discount, onApply, isApplied = false }: DiscountDisplayCardProps) => {
    return (
        <Card className={isApplied ? "border-primary" : ""}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Tag className="h-5 w-5 text-primary"/>
                            {discount.code}
                        </CardTitle>
                        <CardDescription>
                            {getDiscountValue(discount.parameters)} {/* You'll need a similar helper */}
                        </CardDescription>
                    </div>
                    <Button
                        variant={isApplied ? "secondary" : "default"}
                        onClick={() => onApply(discount)}
                        disabled={isApplied}
                    >
                        {isApplied ? "Applied" : "Apply"}
                    </Button>
                </div>
            </CardHeader>
        </Card>
    );
};