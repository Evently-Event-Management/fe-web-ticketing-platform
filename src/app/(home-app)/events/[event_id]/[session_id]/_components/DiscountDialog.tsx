// components/ui/DiscountDialog.tsx

"use client"

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DiscountDTO } from "@/types/event";
import { getDiscountByCode } from "@/lib/actions/public/eventActions";
import { DiscountDisplayCard } from "./DiscountDisplayCard";

interface DiscountDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyDiscount: (discount: DiscountDTO) => void;
    publicDiscounts: DiscountDTO[];
    appliedDiscount: DiscountDTO | null;
    eventId: string;
    sessionId: string;
}

export const DiscountDialog = ({ isOpen, onClose, onApplyDiscount, publicDiscounts, appliedDiscount, eventId, sessionId }: DiscountDialogProps) => {
    const [codeInput, setCodeInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleValidateCode = async () => {
        if (!codeInput) return;
        setIsLoading(true);
        try {
            const result = await getDiscountByCode(eventId, sessionId, codeInput);
            if (result) {
                onApplyDiscount(result);
                toast.success(`Discount "${result.code}" applied!`);
                onClose(); // Close dialog on success
            } else {
                toast.error("Invalid or inapplicable discount code.");
            }
        } catch (e) {
            toast.error("Failed to validate discount.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Apply a Discount</DialogTitle>
                    <DialogDescription>
                        Enter a code below or choose from one of the available public offers.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="ENTER CODE"
                            value={codeInput}
                            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                            className="uppercase"
                        />
                        <Button onClick={handleValidateCode} disabled={!codeInput || isLoading}>
                            {isLoading ? "..." : "Apply"}
                        </Button>
                    </div>

                    {publicDiscounts.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground">Available Public Offers</h4>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {publicDiscounts.map(discount => (
                                    <DiscountDisplayCard
                                        key={discount.id}
                                        discount={discount}
                                        onApply={() => {
                                            onApplyDiscount(discount);
                                            onClose();
                                        }}
                                        isApplied={appliedDiscount?.id === discount.id}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};