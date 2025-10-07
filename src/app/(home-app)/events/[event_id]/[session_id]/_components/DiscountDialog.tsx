"use client"

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DiscountDTO } from "@/types/event";
import { getDiscountByCode } from "@/lib/actions/public/eventActions";
import { DiscountDisplayCard } from "./DiscountDisplayCard";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { DiscountType } from "@/types/enums/discountType";

interface DiscountDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyDiscount: (discount: DiscountDTO) => void;
    publicDiscounts: DiscountDTO[];
    appliedDiscount: DiscountDTO | null;
    eventId: string;
    sessionId: string;
}

// Add border colors that match the discount type's color scheme
const borderColors = {
    [DiscountType.PERCENTAGE]: "border-orange-500",
    [DiscountType.FLAT_OFF]: "border-green-500",
    [DiscountType.BUY_N_GET_N_FREE]: "border-blue-500"
};

// Add glow colors for the animation
const glowColors = {
    [DiscountType.PERCENTAGE]: "rgba(234, 88, 12, 0.5)", // orange glow
    [DiscountType.FLAT_OFF]: "rgba(22, 163, 74, 0.5)",   // green glow
    [DiscountType.BUY_N_GET_N_FREE]: "rgba(37, 99, 235, 0.5)" // blue glow
};

export const DiscountDialog = ({ isOpen, onClose, onApplyDiscount, publicDiscounts, appliedDiscount, eventId, sessionId }: DiscountDialogProps) => {
    // Initialize codeInput with URL discount parameter if available
    const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const urlDiscountCode = searchParams.get('discount') || '';
    
    const [codeInput, setCodeInput] = useState(urlDiscountCode);
    const [isLoading, setIsLoading] = useState(false);
    const [loadedDiscount, setLoadedDiscount] = useState<DiscountDTO | null>(null);
    const [showLoadedAnimation, setShowLoadedAnimation] = useState(false);

    const handleValidateCode = async () => {
        if (!codeInput) return;
        setIsLoading(true);
        setLoadedDiscount(null); // Reset previous loaded discount
        try {
            const result = await getDiscountByCode(eventId, sessionId, codeInput);
            if (result) {
                setLoadedDiscount(result);
                setShowLoadedAnimation(true);
                setTimeout(() => setShowLoadedAnimation(false), 1500); // Animation duration
                toast.success("Discount code found! Click 'Apply' to use it.");
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

    // Clear the loaded discount when the dialog closes
    React.useEffect(() => {
        if (!isOpen) {
            setLoadedDiscount(null);
        }
    }, [isOpen]);

    // Get appropriate border and glow colors based on discount type
    const getDiscountBorderColor = (type: DiscountType) => borderColors[type] || 'border-amber-500';
    const getDiscountGlowColor = (type: DiscountType) => glowColors[type] || 'rgba(245, 158, 11, 0.5)'; // Default to amber

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
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : "Verify"}
                            </Button>
                        </div>
                    </div>

                    {/* Loaded Manual Discount */}
                    <AnimatePresence>
                        {loadedDiscount && (
                            <motion.div
                                className="space-y-3"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-medium text-foreground">Validated Discount Code</h4>
                                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></div>
                                </div>

                                <motion.div
                                    className={`border-2 ${showLoadedAnimation ? getDiscountBorderColor(loadedDiscount.parameters.type) : 'border-transparent'} rounded-lg`}
                                    animate={{
                                        boxShadow: showLoadedAnimation
                                            ? [
                                                '0px 0px 0px rgba(0, 0, 0, 0)',
                                                `0px 0px 20px ${getDiscountGlowColor(loadedDiscount.parameters.type)}`,
                                                '0px 0px 0px rgba(0, 0, 0, 0)'
                                              ]
                                            : '0px 0px 0px rgba(0, 0, 0, 0)'
                                    }}
                                    transition={{ duration: 1.5 }}
                                >
                                    <DiscountDisplayCard
                                        key={loadedDiscount.id}
                                        discount={loadedDiscount}
                                        onApply={(applied) => {
                                            onApplyDiscount(applied);
                                            onClose();
                                        }}
                                        isApplied={appliedDiscount?.id === loadedDiscount.id}
                                        isManuallyLoaded={true}
                                    />
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Bottom Section: Public Offers */}
                    {publicDiscounts.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-foreground">Available Public Offers</h4>
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