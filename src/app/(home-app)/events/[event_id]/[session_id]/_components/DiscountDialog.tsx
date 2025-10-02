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
                onClose();
            } else {
                toast.error("Invalid or inapplicable discount code.");
            }
        } catch (e) {
            console.error(e)
            toast.error("Failed to validate discount.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl"> {/* Adjusted width slightly */}
                <DialogHeader>
                    <DialogTitle className="text-xl">Apply a Discount</DialogTitle>
                    <DialogDescription>
                        Enter a code or choose from one of the available public offers below.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-2">
                    {/* Top Section: Manual Input */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-foreground">Have a code?</h4>
                        <div className="flex items-center gap-2 max-w-sm">
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
                    </div>

                    {/* Bottom Section: Public Offers */}
                    {publicDiscounts.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-foreground">Available Public Offers</h4>
                            {/* ✅ UPDATED: Changed from a grid to a vertical stack */}
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-3">
                                {publicDiscounts.map(discount => (
                                    <DiscountDisplayCard
                                        key={discount.id}
                                        discount={discount}
                                        onApply={(applied) => {
                                            onApplyDiscount(applied);
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