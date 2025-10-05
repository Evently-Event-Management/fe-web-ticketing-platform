"use client";

import {useState, useEffect} from "react";
import {useEventContext} from "@/providers/EventProvider";
import {Skeleton} from "@/components/ui/skeleton";
import {AlertTriangle, Plus, RefreshCcw} from "lucide-react";
import {Button} from "@/components/ui/button";
import {DiscountResponse, getDiscounts, deleteDiscount} from "@/lib/actions/discountActions";
import {toast} from "sonner";
import {DiscountList} from "@/app/manage/organization/[organization_id]/event/_components/discounts/discount-list";
import {
    DiscountFormDialog
} from "@/app/manage/organization/[organization_id]/event/_components/discounts/discount-form-dialog";

export default function DiscountManagementPage() {
    const {event, isLoading: isEventLoading} = useEventContext();
    const [discounts, setDiscounts] = useState<DiscountResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [dialogState, setDialogState] = useState<{
        mode: 'create' | 'edit' | null;
        data?: DiscountResponse;
    }>({mode: null});

    const pageSize = 1000;

    const fetchDiscounts = async () => {
        if (!event?.id) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await getDiscounts(event.id, true, 0, pageSize);
            setDiscounts(response || []);
        } catch (err) {
            const message = "Failed to load discounts. Please try again.";
            setError(message);
            console.error(err);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (event?.id) {
            fetchDiscounts();
        }
    }, [event?.id]);

    const handleOpenCreateDialog = () => {
        setDialogState({mode: 'create'});
    };

    const handleOpenEditDialog = (discount: DiscountResponse) => {
        setDialogState({mode: 'edit', data: discount});
    };

    const handleOnSuccess = () => {
        setDialogState({mode: null});
        fetchDiscounts();
    };

    const handleDeleteDiscount = async (discountId: string) => {
        if (!event?.id) return;
        if (!confirm("Are you sure you want to delete this discount? This action cannot be undone.")) return;

        const toastId = toast.loading("Deleting discount...");
        try {
            await deleteDiscount(event.id, discountId);
            toast.success("Discount deleted successfully.", {id: toastId});
            fetchDiscounts();
        } catch (err) {
            toast.error("Failed to delete discount.", {id: toastId});
            console.error(err);
        }
    };

    if (isEventLoading) {
        return (
            <div className="p-4 md:p-8 w-full">
                <div className="max-w-5xl mx-auto">
                    <Skeleton className="h-10 w-64 mb-4"/>
                    <Skeleton className="h-6 w-96 mb-8"/>
                    <Skeleton className="h-64 w-full"/>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="container mx-auto p-8 flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-destructive/10 rounded-full mb-4">
                    <AlertTriangle className="h-8 w-8 text-destructive"/>
                </div>
                <h2 className="text-xl font-semibold text-destructive">
                    Event not found
                </h2>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 w-full">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Discount Management</h1>
                        <p className="text-muted-foreground">
                            Create and manage discounts for {event.title}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchDiscounts}
                            disabled={isLoading}
                        >
                            <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}/>
                            Refresh
                        </Button>
                        <Button onClick={handleOpenCreateDialog}>
                            <Plus className="h-4 w-4 mr-2"/>
                            New Discount
                        </Button>
                    </div>
                </div>

                {error ? (
                    <div className="p-4 border border-destructive/50 rounded-md bg-destructive/10 text-destructive">
                        {error}
                    </div>
                ) : isLoading ? (
                    <Skeleton className="h-64 w-full"/>
                ) : discounts.length === 0 ? (
                    <div className="text-center p-8 border rounded-md">
                        <p className="mb-4">No discounts found</p>
                        <Button onClick={handleOpenCreateDialog} variant="outline">
                            Create your first discount
                        </Button>
                    </div>
                ) : (
                    <DiscountList
                        discounts={discounts}
                        onEdit={handleOpenEditDialog}
                        onDelete={handleDeleteDiscount}
                        tiers={event.tiers || []}
                        sessions={event.sessions || []}
                        eventId={event.id}
                    />
                )}
            </div>

            {dialogState.mode && (
                <DiscountFormDialog
                    open={dialogState.mode !== null}
                    onOpenChange={(isOpen) => {
                        if (!isOpen) setDialogState({mode: null});
                    }}
                    mode={dialogState.mode}
                    initialData={dialogState.data}
                    onSuccess={handleOnSuccess}
                    eventId={event.id}
                    tiers={event.tiers || []}
                    sessions={event.sessions || []}
                />
            )}
        </div>
    );
}
