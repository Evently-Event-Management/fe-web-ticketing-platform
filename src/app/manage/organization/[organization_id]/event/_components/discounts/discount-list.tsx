"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {DiscountType} from "@/types/enums/discountType";

// Mock data for existing discount codes
const mockDiscountCodes = [
    {
        id: "1",
        code: "SAVE20",
        type: DiscountType.PERCENTAGE,
        parameters: { percentage: 20 },
        isActive: true,
        isPublic: true,
        maxUsage: 100,
        currentUsage: 23,
        activeFrom: "2024-01-01T00:00:00Z",
        expiresAt: "2024-12-31T23:59:59Z",
        applicableTierIds: ["1", "2"],
        applicableSessions: ["1", "2", "3"],
        createdAt: "2024-01-01T00:00:00Z",
    },
    {
        id: "2",
        code: "EARLY2024",
        type: DiscountType.FLAT_OFF,
        parameters: { amount: 50 },
        isActive: true,
        isPublic: false,
        maxUsage: 50,
        currentUsage: 12,
        activeFrom: "2024-01-15T00:00:00Z",
        expiresAt: "2024-03-31T23:59:59Z",
        applicableTierIds: ["1"],
        applicableSessions: ["1"],
        createdAt: "2024-01-10T00:00:00Z",
    },
    {
        id: "3",
        code: "BOGO2024",
        type: DiscountType.BUY_N_GET_N_FREE,
        parameters: { buyQuantity: 2, getQuantity: 1 },
        isActive: false,
        isPublic: true,
        maxUsage: null,
        currentUsage: 5,
        activeFrom: null,
        expiresAt: null,
        applicableTierIds: ["2", "3", "4"],
        applicableSessions: ["2", "3"],
        createdAt: "2024-02-01T00:00:00Z",
    },
]

const mockTiers = [
    { id: "1", name: "VIP", color: "#FFD700" },
    { id: "2", name: "Premium", color: "#C0C0C0" },
    { id: "3", name: "Standard", color: "#CD7F32" },
    { id: "4", name: "Basic", color: "#808080" },
]

export function DiscountList() {
    const [searchTerm, setSearchTerm] = useState("")
    const [filterType, setFilterType] = useState<string>("all")
    const [filterStatus, setFilterStatus] = useState<string>("all")

    const getDiscountIcon = (type: DiscountType) => {
        switch (type) {
            case DiscountType.PERCENTAGE:
                return <Percent className="h-4 w-4" />
            case DiscountType.FLAT_OFF:
                return <DollarSign className="h-4 w-4" />
            case DiscountType.BUY_N_GET_N_FREE:
                return <Gift className="h-4 w-4" />
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
            .map((id) => mockTiers.find((tier) => tier.id === id)?.name)
            .filter(Boolean)
            .join(", ")
    }

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code)
        // You could add a toast notification here
    }

    const toggleDiscountStatus = (id: string) => {
        // Handle status toggle
        console.log("Toggle status for discount:", id)
    }

    const filteredCodes = mockDiscountCodes.filter((code) => {
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
                        <Filter className="h-4 w-4" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                                <SelectValue placeholder="Filter by type" />
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
                                <SelectValue placeholder="Filter by status" />
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
                {filteredCodes.map((discount) => (
                    <Card key={discount.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
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
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    Public
                                                </Badge>
                                            )}
                                            {!discount.isPublic && (
                                                <Badge variant="outline">
                                                    <EyeOff className="h-3 w-3 mr-1" />
                                                    Private
                                                </Badge>
                                            )}
                                        </div>

                                        <p className="text-sm font-medium text-primary">
                                            {getDiscountValue(discount.type, discount.parameters)}
                                        </p>

                                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                            {discount.maxUsage && (
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4" />
                                                    {discount.currentUsage}/{discount.maxUsage} used
                                                </div>
                                            )}
                                            {discount.expiresAt && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    Expires {new Date(discount.expiresAt).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground">
                                                Applicable Tiers: {getTierNames(discount.applicableTierIds)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Sessions: {discount.applicableSessions.length} selected
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Switch checked={discount.isActive} onCheckedChange={() => toggleDiscountStatus(discount.id)} />
                                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(discount.code)}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">
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
                            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">No discount codes found</p>
                            <p className="text-sm">Try adjusting your search or filter criteria</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
