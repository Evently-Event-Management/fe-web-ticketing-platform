"use client"

import {Card, CardContent, CardHeader} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Switch} from "@/components/ui/switch"
import {formatCurrency} from "@/lib/utils"
import {
    Edit, Trash2, Copy, Eye, EyeOff, Percent, DollarSign, Gift,
    Calendar, Users, MoreHorizontal,
} from "lucide-react"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import {DiscountType} from "@/types/enums/discountType";
import {CreateEventFormData, DiscountParsed} from "@/lib/validators/event";
import {FieldArrayWithId} from "react-hook-form";
import {toast} from "sonner";
import {format} from "date-fns";

// --- Component Props ---
interface DiscountCardProps {
    discount: FieldArrayWithId<CreateEventFormData, "discounts", "id">,
    index: number,
    tiers: FieldArrayWithId<CreateEventFormData, "tiers", "id">[],
    sessions?: FieldArrayWithId<CreateEventFormData, "sessions", "id">[],
    onDelete?: (index: number) => void,
    onToggleStatus?: (index: number) => void,
    onEdit?: (index: number) => void,
    isReadOnly?: boolean,
}

// --- Helper Functions ---
const getDiscountIcon = (type: DiscountType) => {
    switch (type) {
        case DiscountType.PERCENTAGE:
            return <Percent className="h-5 w-5"/>;
        case DiscountType.FLAT_OFF:
            return <DollarSign className="h-5 w-5"/>;
        case DiscountType.BUY_N_GET_N_FREE:
            return <Gift className="h-5 w-5"/>;
        default:
            return <Percent className="h-5 w-5"/>;
    }
}

const getDiscountValue = (discount: DiscountParsed) => {
    switch (discount.type) {
        case DiscountType.PERCENTAGE:
            return `${discount.parameters.percentage}% OFF`;
        case DiscountType.FLAT_OFF:
            return `${formatCurrency(discount.parameters.amount, 'LKR')} OFF`;
        case DiscountType.BUY_N_GET_N_FREE:
            return `Buy ${discount.parameters.buyQuantity}, Get ${discount.parameters.getQuantity} Free`;
    }
}

export function DiscountCard({
                                 discount,
                                 index,
                                 tiers,
                                 sessions,
                                 onDelete,
                                 onToggleStatus,
                                 onEdit,
                                 isReadOnly
                             }: DiscountCardProps) {

    const getTierNames = (tierIds?: string[]) => {
        const ids = tierIds || [];
        if (!tiers?.length || ids.length === tiers.length) return "All Tiers";
        if (ids.length === 0) return "No Tiers Selected";
        return ids.map(id => tiers.find(tier => tier.id === id)?.name).filter(Boolean).join(", ");
    }

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code).then(() => toast.success(`Code "${code}" copied!`));
    }

    // ✅ FIX: Pre-format dates to prevent 'unknown' type errors in JSX
    const formatDate = (dateString?: string | null) => {
        if (!dateString) return null;
        return format(new Date(dateString), 'MMM d, p');
    };

    const activeFromDate = formatDate(discount.activeFrom);
    const expiresAtDate = formatDate(discount.expiresAt);

    // ✅ FIX: Use a safe fallback for arrays that might be undefined
    const applicableSessionIds = discount.applicableSessionIds || [];
    const sessionsCount = sessions?.length || 0;

    return (
        <Card key={discount.id} className="hover:shadow-md transition-shadow gap-4">
            <CardHeader className="flex items-start justify-between py-0">
                <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                        {getDiscountIcon(discount.type)}
                    </div>
                    <div className="flex-1 ">
                        <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">{discount.code}</h3>
                            <Badge variant={discount.isActive ? "default" : "secondary"}>
                                {discount.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {discount.isPublic && (
                                <Badge variant="outline">
                                    <Eye className="h-3 w-3 mr-1"/>
                                    Public
                                </Badge>
                            )}
                            {!discount.isPublic && (
                                <Badge variant="outline">
                                    <EyeOff className="h-3 w-3 mr-1"/>
                                    Private
                                </Badge>
                            )}
                        </div>

                        <p className="text-sm font-medium text-primary">
                            {getDiscountValue(discount as DiscountParsed)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {!isReadOnly && onToggleStatus && (
                        <Switch
                            checked={discount.isActive}
                            onCheckedChange={() => onToggleStatus(index)}
                        />
                    )}
                    <Button type={'button'} variant="outline" size="sm"
                            onClick={() => copyToClipboard(discount.code)}>
                        <Copy className="h-4 w-4"/>
                    </Button>
                    {!isReadOnly && onEdit && onDelete && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <MoreHorizontal className="h-4 w-4"/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => onEdit(index)}>
                                    <Edit className="h-4 w-4 mr-2"/>
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onSelect={() => onDelete(index)}
                                >
                                    <Trash2 className="h-4 w-4 mr-2"/>
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </CardHeader>
            <CardContent className="">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                        <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                {discount.maxUsage && (
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4"/>
                                        <span>{discount.maxUsage} use limit</span>
                                    </div>
                                )}
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

                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                    Applicable Tiers: {getTierNames(discount.applicableTierIds)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {/* ✅ FIX: Use the safe fallback variables */}
                                    Sessions: {sessionsCount > 0 && applicableSessionIds.length === sessionsCount ? "All Sessions" : `${applicableSessionIds.length} Selected`}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}