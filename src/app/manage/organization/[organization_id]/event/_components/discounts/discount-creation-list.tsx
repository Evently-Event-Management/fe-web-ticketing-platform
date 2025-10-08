"use client"

import {useMemo, useState} from "react"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Search, Filter} from "lucide-react"
import {DiscountType} from "@/types/enums/discountType";
import {DiscountDTO, SessionDTO, TierDTO} from "@/lib/validators/event";
import {DiscountCard} from "./discount-creation-card";

interface DiscountListProps {
    tiers: TierDTO[],
    sessions?: SessionDTO[],
    discounts?: DiscountDTO[],
    onDelete?: (id: string) => void,
    onToggleStatus?: (id: string) => void,
    onEdit?: (discount: DiscountDTO) => void,
    filters?: boolean,
    isReadOnly?: boolean,
}

export function DiscountList({
                                 tiers,
                                 sessions,
                                 discounts,
                                 onDelete,
                                 onToggleStatus,
                                 onEdit,
                                 filters = true,
                                 isReadOnly = false
                             }: DiscountListProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [filterType, setFilterType] = useState<string>("all")
    const [filterStatus, setFilterStatus] = useState<string>("all")

    const filteredCodes = useMemo(() => {
        if (!discounts) return []
        return discounts.filter((code) => {
            if (!code) return false;
            const matchesSearch = code.code.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesType = filterType === "all" || code.parameters.type === filterType
            const matchesStatus =
                filterStatus === "all" ||
                (filterStatus === "active" && code.active) ||
                (filterStatus === "inactive" && !code.active)
            return matchesSearch && matchesType && matchesStatus
        })
    }, [discounts, searchTerm, filterType, filterStatus])

    return (
        <div className="space-y-6">
            {filters && (
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
            )}

            <div className="grid gap-4">
                {filteredCodes.map((discount) => (
                    <DiscountCard
                        key={discount.id}
                        discount={discount}
                        tiers={tiers}
                        sessions={sessions}
                        onDelete={onDelete}
                        onToggleStatus={onToggleStatus}
                        onEdit={onEdit}
                        isReadOnly={isReadOnly}
                    />
                ))}
            </div>

            {filteredCodes.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <div className="text-muted-foreground">
                            <Search className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                            <p className="text-lg font-medium mb-2">
                                {filters ? "No discount codes match your filters." : "No discount codes available."}
                            </p>
                            <p className="text-sm">
                                {filters ? "Try adjusting your search or filter criteria." : "Create discount codes to offer special promotions for your event."}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}