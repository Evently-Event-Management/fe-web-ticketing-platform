"use client"

import {useEffect} from "react"
import {Controller, useForm} from "react-hook-form"
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Switch} from "@/components/ui/switch"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {CalendarIcon, Percent, DollarSign, Gift} from "lucide-react"
import {
    DiscountParsed,
    discountSchema,
    SessionParsed,
    TierParsed
} from "@/lib/validators/event"
import {TierSelector} from "./tier-selector"
import {SessionSelector} from "./session-selector"
import {DiscountType} from "@/types/enums/discountType";
import {toast} from "sonner";
import {formatToDateTimeLocalString} from "@/lib/utils";

interface DiscountCodeFormProps {
    tiers: TierParsed[],
    sessions: SessionParsed[],
    onSave: (discount: DiscountParsed) => void,
    isQuickCreate?: boolean,
    isEditing?: boolean,
    initialData?: DiscountParsed,
}

type PercentageParams = {
    type: DiscountType.PERCENTAGE,
    percentage: number,
    minSpend?: number | null,
    maxDiscount?: number | null
};
type FlatOffParams = {
    type: DiscountType.FLAT_OFF,
    amount: number,
    currency: string,
    minSpend?: number | null
};
type BogoParams = {
    type: DiscountType.BUY_N_GET_N_FREE,
    buyQuantity: number,
    getQuantity: number
};


export function DiscountCodeForm({
                                     isQuickCreate = false,
                                     tiers,
                                     sessions,
                                     onSave,
                                     initialData,
                                     isEditing
                                 }: DiscountCodeFormProps) {
    const form = useForm<z.input<typeof discountSchema>>({
        resolver: zodResolver(discountSchema),
        defaultValues: {
            id: crypto.randomUUID(),
            code: "",
            parameters: {type: DiscountType.PERCENTAGE, percentage: 10, minSpend: null, maxDiscount: null},
            maxUsage: null,
            isActive: true,
            isPublic: false,
            activeFrom: null,
            expiresAt: null,
            applicableTierIds: tiers.map((t) => t.id),
            applicableSessionIds: sessions.map((s) => s.id),
        },
    })

    useEffect(() => {
        if (initialData) {
            form.reset(initialData);
        }
    }, [initialData, form.reset, form]);

    const selectedTiers = form.watch("applicableTierIds");
    const selectedSessions = form.watch("applicableSessionIds");
    const discountType = form.watch('parameters.type')
    const parameters = form.watch('parameters');


    const onSubmit = (data: z.input<typeof discountSchema>) => {
        // We use our local state for tiers/sessions, not the form state
        console.log(`Submitting form with data2:`, data);
        const validatedResult = discountSchema.safeParse(data);

        if (!validatedResult.success) {
            validatedResult.error.issues.forEach((issue) => toast.error(issue.message));
            return;
        }

        onSave(validatedResult.data as DiscountParsed)

        // ✅ UX IMPROVEMENT: Reset the local form for the next entry
        form.reset({
            id: crypto.randomUUID(),
            code: "",
            parameters: {percentage: 10, type: DiscountType.PERCENTAGE, minSpend: null, maxDiscount: null},
            maxUsage: null,
            isActive: true,
            isPublic: false,
            activeFrom: null,
            expiresAt: null,
            applicableTierIds: tiers.map((t) => t.id),
            applicableSessionIds: sessions.map((s) => s.id),
        });
    }

    const getDiscountIcon = (type: DiscountType) => {
        switch (type) {
            case DiscountType.PERCENTAGE:
                return <Percent className="h-4 w-4"/>
            case DiscountType.FLAT_OFF:
                return <DollarSign className="h-4 w-4"/>
            case DiscountType.BUY_N_GET_N_FREE:
                return <Gift className="h-4 w-4"/>
            default:
                return <Percent className="h-4 w-4"/>
        }
    }

    const handleOptionalNumberChange = (value: string) => {
        return value === "" ? null : Number(value);
    }

    return (
        <div className="space-y-6">
            {!isQuickCreate && (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {getDiscountIcon(discountType)}
                                Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Discount Code *</Label>
                                    <Input
                                        id="code"
                                        placeholder="e.g., SAVE20, EARLY2024"
                                        {...form.register("code")}
                                        className="uppercase"
                                    />
                                    {form.formState.errors.code && (
                                        <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">Discount Type *</Label>
                                    <Select
                                        value={discountType}
                                        onValueChange={(value: DiscountType) => {
                                            switch (value) {
                                                case DiscountType.PERCENTAGE:
                                                    form.setValue("parameters", {
                                                        percentage: 10,
                                                        type: DiscountType.PERCENTAGE,
                                                        minSpend: null,
                                                        maxDiscount: null
                                                    })
                                                    break
                                                case DiscountType.FLAT_OFF:
                                                    form.setValue("parameters", {
                                                        amount: 1000,
                                                        currency: "LKR",
                                                        type: DiscountType.FLAT_OFF,
                                                        minSpend: null
                                                    })
                                                    break
                                                case DiscountType.BUY_N_GET_N_FREE:
                                                    form.setValue("parameters", {
                                                        buyQuantity: 2,
                                                        getQuantity: 1,
                                                        type: DiscountType.BUY_N_GET_N_FREE
                                                    })
                                                    break
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={DiscountType.PERCENTAGE}>
                                                <div className="flex items-center gap-2">
                                                    <Percent className="h-4 w-4"/>
                                                    Percentage Off
                                                </div>
                                            </SelectItem>
                                            <SelectItem value={DiscountType.FLAT_OFF}>
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="h-4 w-4"/>
                                                    Fixed Amount Off
                                                </div>
                                            </SelectItem>
                                            <SelectItem value={DiscountType.BUY_N_GET_N_FREE}>
                                                <div className="flex items-center gap-2">
                                                    <Gift className="h-4 w-4"/>
                                                    Buy N Get N Free
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Discount Parameters */}
                            <div className="space-y-4">
                                {/* Discount Parameters */}
                                {discountType === DiscountType.PERCENTAGE && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="percentage">Percentage (%) *</Label>
                                            <Input
                                                id="percentage" type="number" min="0.1" max="100" placeholder="10"
                                                value={(parameters as PercentageParams)?.percentage || ''}
                                                onChange={(e) => form.setValue("parameters", {
                                                    ...(parameters as PercentageParams),
                                                    type: DiscountType.PERCENTAGE,
                                                    percentage: Number(e.target.value) || 0
                                                }, {shouldValidate: true})}/>
                                        </div>
                                        {/* ✅ ADDED: minSpend and maxDiscount inputs */}
                                        <div className="space-y-2">
                                            <Label htmlFor="minSpend">Minimum Spend (Optional)</Label>
                                            <Input
                                                id="minSpend" type="number" min="0" placeholder="e.g., 5000"
                                                value={(parameters as PercentageParams)?.minSpend || ''}
                                                onChange={(e) => form.setValue("parameters", {
                                                    ...(parameters as PercentageParams),
                                                    type: DiscountType.PERCENTAGE,
                                                    minSpend: handleOptionalNumberChange(e.target.value)
                                                }, {shouldValidate: true})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="maxDiscount">Max Discount (Optional)</Label>
                                            <Input
                                                id="maxDiscount" type="number" min="0" placeholder="e.g., 2000"
                                                value={(parameters as PercentageParams)?.maxDiscount || ''}
                                                onChange={(e) => form.setValue("parameters", {
                                                    ...(parameters as PercentageParams),
                                                    type: DiscountType.PERCENTAGE,
                                                    maxDiscount: handleOptionalNumberChange(e.target.value)
                                                }, {shouldValidate: true})}
                                            />
                                        </div>
                                    </div>
                                )}

                                {discountType === DiscountType.FLAT_OFF && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="amount">Amount (LKR) *</Label>
                                            <Input
                                                id="amount" type="number" min="0.01" step="0.01" placeholder="1000.00"
                                                value={(parameters as FlatOffParams)?.amount || ''}
                                                onChange={(e) => {
                                                    form.setValue("parameters", {
                                                        ...(parameters as FlatOffParams),
                                                        amount: Number(e.target.value),
                                                        currency: "LKR",
                                                        type: DiscountType.FLAT_OFF
                                                    }, {shouldValidate: true})
                                                }}
                                            />
                                        </div>
                                        {/* ✅ ADDED: minSpend input */}
                                        <div className="space-y-2">
                                            <Label htmlFor="minSpend">Minimum Spend (Optional)</Label>
                                            <Input
                                                id="minSpend" type="number" min="0" placeholder="e.g., 5000"
                                                value={(parameters as FlatOffParams)?.minSpend || ''}
                                                onChange={(e) => form.setValue("parameters", {
                                                    ...(parameters as FlatOffParams),
                                                    type: DiscountType.FLAT_OFF,
                                                    minSpend: handleOptionalNumberChange(e.target.value)
                                                }, {shouldValidate: true})}
                                            />
                                        </div>
                                    </div>
                                )}

                                {discountType === DiscountType.BUY_N_GET_N_FREE && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="buyQuantity">Buy Quantity</Label>
                                            <Input
                                                id="buyQuantity"
                                                type="number"
                                                min="1"
                                                placeholder="2"
                                                value={(parameters as BogoParams)?.buyQuantity || ''}
                                                onChange={(e) => form.setValue("parameters", {
                                                    type: DiscountType.BUY_N_GET_N_FREE,
                                                    buyQuantity: Number(e.target.value) || 0,
                                                    getQuantity: (parameters as BogoParams)?.getQuantity || 1
                                                }, {shouldValidate: true})}/>
                                            {form.formState.errors.parameters && (
                                                <p className="text-sm text-destructive">{form.formState.errors.parameters.message}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="getQuantity">Get Free Quantity</Label>
                                            <Input
                                                id="getQuantity"
                                                type="number"
                                                min="1"
                                                placeholder="1"
                                                value={(parameters as BogoParams)?.getQuantity || ''}
                                                onChange={(e) => form.setValue("parameters", {
                                                    type: DiscountType.BUY_N_GET_N_FREE,
                                                    buyQuantity: (parameters as BogoParams)?.buyQuantity || 1,
                                                    getQuantity: Number(e.target.value) || 0
                                                }, {shouldValidate: true})}/>
                                            {form.formState.errors.parameters && (
                                                <p className="text-sm text-destructive">{form.formState.errors.parameters.message}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Usage & Validity */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4"/>
                                Usage & Validity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Controller
                                    name="maxUsage"
                                    control={form.control}
                                    render={({field}) => (
                                        <div className="space-y-2">
                                            <Label htmlFor="maxUsage">Max Usage (Optional)</Label>
                                            <Input
                                                id="maxUsage"
                                                type="number"
                                                min="1"
                                                placeholder="Unlimited"
                                                ref={field.ref}
                                                name={field.name}
                                                onBlur={field.onBlur}
                                                value={field.value ?? ""}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    field.onChange(value === "" ? null : parseInt(value, 10));
                                                }}
                                            />
                                            {form.formState.errors.maxUsage && (
                                                <p className="text-sm text-destructive">{form.formState.errors.maxUsage.message}</p>
                                            )}
                                        </div>
                                    )}
                                />

                                <Controller
                                    name="activeFrom"
                                    control={form.control}
                                    render={({field}) => (
                                        <div className="space-y-2">
                                            <Label htmlFor="activeFrom">Active From (Optional)</Label>
                                            <Input
                                                id="activeFrom"
                                                type="datetime-local"
                                                value={formatToDateTimeLocalString(field.value as string | null)}
                                                onChange={(e) => {
                                                    const rawValue = e.target.value;
                                                    const processedValue = rawValue ? new Date(rawValue).toISOString() : null;
                                                    field.onChange(processedValue);
                                                }}
                                                ref={field.ref}
                                            />
                                            {form.formState.errors.activeFrom && (
                                                <p className="text-sm text-destructive">{form.formState.errors.activeFrom.message}</p>
                                            )}
                                        </div>
                                    )}
                                />

                                <Controller
                                    name="expiresAt"
                                    control={form.control}
                                    render={({field}) => (
                                        <div className="space-y-2">
                                            <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                                            <Input
                                                id="expiresAt"
                                                type="datetime-local"
                                                value={formatToDateTimeLocalString(field.value as string | null)}
                                                onChange={(e) => {
                                                    const rawValue = e.target.value;
                                                    const processedValue = rawValue ? new Date(rawValue).toISOString() : null;
                                                    field.onChange(processedValue);
                                                }}
                                                ref={field.ref}
                                            />
                                            {form.formState.errors.expiresAt && (
                                                <p className="text-sm text-destructive">{form.formState.errors.expiresAt.message}</p>
                                            )}
                                        </div>
                                    )}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="isActive"
                                        checked={form.watch("isActive")}
                                        onCheckedChange={(checked) => form.setValue("isActive", checked)}
                                    />
                                    <Label htmlFor="isActive">Active</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="isPublic"
                                        checked={form.watch("isPublic")}
                                        onCheckedChange={(checked) => form.setValue("isPublic", checked)}
                                    />
                                    <Label htmlFor="isPublic">Public (Visible to all users)</Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Applicable Tiers */}
                    <TierSelector tiers={tiers} selectedTiers={selectedTiers} onSelectionChange={
                        (newSelection) => form.setValue("applicableTierIds", newSelection, {shouldValidate: true})
                    }/>
                    {form.formState.errors.applicableTierIds && (
                        <p className="text-sm text-destructive">{form.formState.errors.applicableTierIds.message}</p>
                    )}

                    {/* Applicable Sessions */}
                    <SessionSelector
                        sessions={sessions}
                        selectedSessions={selectedSessions}
                        onSelectionChange={(newSelection) => form.setValue("applicableSessionIds", newSelection, {shouldValidate: true})}
                    />
                    {form.formState.errors.applicableSessionIds && (
                        <p className="text-sm text-destructive">{form.formState.errors.applicableSessionIds.message}</p>
                    )}
                </>
            )}

            {isQuickCreate && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="quick-code">Discount Code</Label>
                        <Input id="quick-code" placeholder="e.g., SAVE20" {...form.register("code")}
                               className="uppercase"/>
                        {form.formState.errors.code && (
                            <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="quick-type">Type</Label>
                        <Select value={discountType}
                                onValueChange={(value: DiscountType) => {
                                    switch (value) {
                                        case DiscountType.PERCENTAGE:
                                            form.setValue("parameters", {
                                                percentage: 10,
                                                type: DiscountType.PERCENTAGE
                                            })
                                            break
                                        case DiscountType.FLAT_OFF:
                                            form.setValue("parameters", {
                                                amount: 1000,
                                                currency: "LKR",
                                                type: DiscountType.FLAT_OFF
                                            })
                                            break
                                        default:
                                            form.setValue("parameters", {
                                                percentage: 10,
                                                type: DiscountType.PERCENTAGE
                                            })
                                            break
                                    }
                                }}>
                            <SelectTrigger>
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={DiscountType.PERCENTAGE}>Percentage Off</SelectItem>
                                <SelectItem value={DiscountType.FLAT_OFF}>Fixed Amount Off</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label
                            htmlFor="quick-value">{discountType === DiscountType.PERCENTAGE ? 'Percentage (%)' : 'Amount (LKR)'}</Label>
                        {discountType === DiscountType.PERCENTAGE ? (
                            <>
                                <Input
                                    id="quick-value"
                                    type="number"
                                    min="1"
                                    max="100"
                                    placeholder="20"
                                    value={(parameters as PercentageParams)?.percentage || ''}
                                    onChange={(e) => form.setValue("parameters", {
                                        type: DiscountType.PERCENTAGE,
                                        percentage: Number(e.target.value) || 0
                                    }, {shouldValidate: true})}/>
                                {form.formState.errors.parameters && (
                                    <p className="text-sm text-destructive">{form.formState.errors.parameters.message}</p>
                                )}
                            </>
                        ) : (
                            <>
                                <Input
                                    id="quick-value"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    placeholder="1000.00"
                                    value={(parameters as FlatOffParams)?.amount || ''}
                                    onChange={(e) => {
                                        form.setValue("parameters", {
                                            amount: Number(e.target.value),
                                            currency: "LKR",
                                            type: DiscountType.FLAT_OFF
                                        }, {shouldValidate: true})
                                    }}
                                />
                                {form.formState.errors.parameters && (
                                    <p className="text-sm text-destructive">{form.formState.errors.parameters.message}</p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
                <Button type="button" size="lg" className="min-w-32" onClick={form.handleSubmit(onSubmit, onError => {
                    console.log("Form submission errors:", onError);
                    toast.error("Please fix the errors in the form before submitting.");
                })}>
                    {isQuickCreate ? "Quick Create" : (isEditing ? "Save Changes" : "Create Discount Code")}
                </Button>
            </div>
        </div>
    )
}
