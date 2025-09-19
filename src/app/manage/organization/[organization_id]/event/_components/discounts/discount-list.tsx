"use client"

import {useState} from "react"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {Input} from "@/components/ui/input"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Switch} from "@/components/ui/switch"
import { format } from "date-fns";
import {
    Search,
    Filter,
    Edit,
    Trash2,
    Copy,
    Eye,
    EyeOff,
    Percent,
    DollarSign,
    Gift,
    Calendar,
    Users,
    MoreHorizontal,
} from "lucide-react"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import {DiscountType} from "@/types/enums/discountType";
import {CreateEventFormData, TierFormData} from "@/lib/validators/event";
import {FieldArrayWithId} from "react-hook-form";
import {toast} from "sonner";

interface DiscountListProps {
    tiers: TierFormData[],
    discounts: FieldArrayWithId<CreateEventFormData, "discounts", "id">[],
    onDelete: (index: number) => void,
    onToggleStatus: (index: number) => void,
    onEdit: (index: number) => void,
}


export function DiscountList({tiers, discounts, onDelete, onToggleStatus, onEdit }: DiscountListProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [filterType, setFilterType] = useState<string>("all")
    const [filterStatus, setFilterStatus] = useState<string>("all")

    const getDiscountIcon = (type: DiscountType) => {
        switch (type) {
            case DiscountType.PERCENTAGE:
                return <Percent className="h-4 w-4"/>
            case DiscountType.FLAT_OFF:
                return <DollarSign className="h-4 w-4"/>
            case DiscountType.BUY_N_GET_N_FREE:
                return <Gift className="h-4 w-4"/>
        }
    }

    const getDiscountValue = (type: DiscountType, parameters: any) => {
        switch (type) {
            case DiscountType.PERCENTAGE:
                return `${parameters.percentage}% off`
            case DiscountType.FLAT_OFF:
                return `$${parameters.amount} off`
            case DiscountType.BUY_N_GET_N_FREE:
                return `Buy ${parameters.buyQuantity}, Get ${parameters.getQuantity} Free`
        }
    }

    const getTierNames = (tierIds: string[]) => {
        return tierIds
            .map((id) => tiers.find((tier) => tier.id === id)?.name)
            .filter(Boolean)
            .join(", ")
    }

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code).then(() => toast.success("Copied to clipboard"))
    }

    const filteredCodes = discounts.filter((code) => {
        const matchesSearch = code.code.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = filterType === "all" || code.type === filterType
        const matchesStatus =
            filterStatus === "all" ||
            (filterStatus === "active" && code.isActive) ||
            (filterStatus === "inactive" && !code.isActive)

        return matchesSearch && matchesType && matchesStatus
    })


    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-4 w-4"/>
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                <Input
                                    placeholder="Search discount codes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Filter by type"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value={DiscountType.PERCENTAGE}>Percentage</SelectItem>
                                <SelectItem value={DiscountType.FLAT_OFF}>Fixed Amount</SelectItem>
                                <SelectItem value={DiscountType.BUY_N_GET_N_FREE}>BOGO</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Filter by status"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Discount Codes List */}
            <div className="grid gap-4">
                {filteredCodes.map((discount, index) => (
                    <Card key={discount.id} className="hover:shadow-md transition-shadow p-0">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4 flex-1">
                                    <div
                                        className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                                        {getDiscountIcon(discount.type)}
                                    </div>

                                    <div className="flex-1 space-y-2">
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
                                            {getDiscountValue(discount.type, discount.parameters)}
                                        </p>

                                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                            {discount.maxUsage && (
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4" />
                                                    <span>{discount.maxUsage} use limit</span>
                                                </div>
                                            )}

                                            {discount.activeFrom && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>Activates {format(new Date(discount.activeFrom as string), 'MMM d, p')}</span>
                                                </div>
                                            )}

                                            {discount.expiresAt && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>Expires {format(new Date(discount.expiresAt as string), 'MMM d, p')}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground">
                                                Applicable Tiers: {getTierNames(discount.applicableTierIds)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Sessions: {discount.applicableSessionIds.length} selected
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={discount.isActive}
                                        onCheckedChange={() => onToggleStatus(index)}
                                    />
                                    <Button type={'button'} variant="outline" size="sm" onClick={() => copyToClipboard(discount.code)}>
                                        <Copy className="h-4 w-4"/>
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onSelect={() => onEdit(index)}>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive"
                                                onSelect={() => onDelete(index)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredCodes.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <div className="text-muted-foreground">
                            <Search className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                            <p className="text-lg font-medium mb-2">No discount codes found</p>
                            <p className="text-sm">Try adjusting your search or filter criteria or creating some</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
