"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
    Edit, Trash2, Copy, Eye, EyeOff, Percent, DollarSign, Gift,
    Calendar, Users, MoreHorizontal, Share2,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DiscountType } from "@/types/enums/discountType";
import { DiscountDTO, SessionDTO, TierDTO } from "@/lib/validators/event";
import { toast } from "sonner";
import { format } from "date-fns";
import { getDiscountValue } from "@/lib/discountUtils";
import { useState } from "react";
import { DiscountShareDialog } from "./discount-share-dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";

// --- Component Props ---
interface DiscountCardProps {
    discount: DiscountDTO,
    tiers: TierDTO[],
    sessions?: SessionDTO[],
    onDelete?: (id: string) => void,
    onToggleStatus?: (id: string) => void,
    onEdit?: (discount: DiscountDTO) => void,
    isReadOnly?: boolean,
    isShareable?: boolean,
}

// --- Helper Functions ---
const getDiscountIcon = (type: DiscountType) => {
    switch (type) {
        case DiscountType.PERCENTAGE:
            return <Percent className="h-5 w-5" />;
        case DiscountType.FLAT_OFF:
            return <DollarSign className="h-5 w-5" />;
        case DiscountType.BUY_N_GET_N_FREE:
            return <Gift className="h-5 w-5" />;
        default:
            return <Percent className="h-5 w-5" />;
    }
}

export function DiscountCard({
    discount,
    tiers,
    sessions,
    onDelete,
    onToggleStatus,
    onEdit,
    isReadOnly = false,
    isShareable = true
}: DiscountCardProps) {
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

    const getTierNames = (tierIds?: string[]) => {
        const ids = tierIds || [];
        if (!tiers?.length || ids.length === tiers.length) return "All Tiers";
        if (ids.length === 0) return "No Tiers Selected";
        return ids.map(id => tiers.find(tier => tier.id === id)?.name).filter(Boolean).join(", ");
    }

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code).then(() => toast.success(`Code "${code}" copied!`));
    }

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return null;
        return format(new Date(dateString), 'MMM d, p');
    };

    const activeFromDate = formatDate(discount.activeFrom);
    const expiresAtDate = formatDate(discount.expiresAt);

    const applicableSessionIds = discount.applicableSessionIds || [];
    const sessionsCount = sessions?.length || 0;

    const usagePercentage = discount.maxUsage && discount.maxUsage > 0
        ? ((discount.currentUsage || 0) / discount.maxUsage) * 100
        : 0;

    return (
        <>
            <Card key={discount.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-start justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <div
                            className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                            {getDiscountIcon(discount.parameters.type)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold">{discount.code}</h3>
                                <Badge variant={discount.active ? "default" : "secondary"}>
                                    {discount.active ? "Active" : "Inactive"}
                                </Badge>
                                {discount.public && (
                                    <Badge variant="outline">
                                        <Eye className="h-3 w-3 mr-1"/>
                                        Public
                                    </Badge>
                                )}
                                {!discount.public && (
                                    <Badge variant="outline">
                                        <EyeOff className="h-3 w-3 mr-1"/>
                                        Private
                                    </Badge>
                                )}
                            </div>

                            <p className="text-sm font-medium text-primary">
                                {getDiscountValue(discount.parameters)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {!isReadOnly && onToggleStatus && (
                            <Switch
                                checked={discount.active}
                                onCheckedChange={() => onToggleStatus(discount.id)}
                            />
                        )}
                        <Button type={'button'} variant="outline" size="sm"
                                onClick={() => copyToClipboard(discount.code)}>
                            <Copy className="h-4 w-4"/>
                        </Button>
                        {isShareable && (
                            <Button
                                type={'button'}
                                variant="outline"
                                size="sm"
                                onClick={() => setIsShareDialogOpen(true)}
                            >
                                <Share2 className="h-4 w-4"/>
                            </Button>
                        )}
                        {!isReadOnly && onEdit && onDelete && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <MoreHorizontal className="h-4 w-4"/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onSelect={() => onEdit(discount)}>
                                        <Edit className="h-4 w-4 mr-2"/>
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-destructive"
                                        onSelect={(e) => e.preventDefault()}
                                    >
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <div className="flex items-center w-full cursor-pointer">
                                                    <Trash2 className="h-4 w-4 mr-2"/>
                                                    Delete
                                                </div>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the
                                                        discount code &#34;{discount.code}&#34;.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => onDelete(discount.id)}
                                                        className="bg-destructive text-white hover:bg-destructive/90"
                                                    >
                                                        Yes, delete discount
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start justify-between gap-4">
                        {/* --- Left Column: Details --- */}
                        <div className="flex-1 space-y-2 text-sm text-muted-foreground">
                            {discount.maxUsage != null ? (
                                <div className="flex items-center gap-2 text-xs">
                                    <Users className="h-4 w-4"/>
                                    <span>Usage Limit:</span>
                                    <div className="relative w-28 h-5 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all"
                                            style={{width: `${usagePercentage}%`}}
                                        />
                                        <span
                                            className="absolute inset-0 flex items-center justify-center text-[11px] font-medium text-white">
                                                {discount.currentUsage || 0}/{discount.maxUsage}
                                            </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-xs">
                                    <Users className="h-4 w-4"/>
                                    <span>Uses:</span>
                                    <span className="font-medium">{discount.currentUsage || 0}</span>
                                </div>
                            )}

                            {activeFromDate && expiresAtDate && (
                                <div className="flex flex-wrap gap-x-4 gap-y-2">
                                    {activeFromDate && (
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4"/>
                                            <span>Activates {activeFromDate}</span>
                                        </div>
                                    )}
                                    {expiresAtDate && (
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4"/>
                                            <span>Expires {expiresAtDate}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                    Applicable Tiers: {getTierNames(discount.applicableTierIds)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Sessions: {sessionsCount > 0 && applicableSessionIds.length === sessionsCount ? "All Sessions" : `${applicableSessionIds.length} Selected`}
                                </p>
                            </div>
                        </div>

                        {/* --- Right Column: Discounted Total (More Compact) --- */}
                        {discount.discountedTotal > 0 && (
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground font-medium">Total Discounted</p>
                                <p className="text-2xl font-bold text-primary">
                                    LKR {discount.discountedTotal.toFixed(2)}
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Share Dialog */}
            {isShareable && (
                <DiscountShareDialog
                    open={isShareDialogOpen}
                    onOpenChange={setIsShareDialogOpen}
                    discount={discount}
                    sessions={sessions}
                />
            )}
        </>
    );
}