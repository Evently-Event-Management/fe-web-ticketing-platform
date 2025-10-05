    "use client";

    import {useState, useEffect, useCallback} from "react";
    import {useEventContext} from "@/providers/EventProvider";
    import {Skeleton} from "@/components/ui/skeleton";
    import {AlertTriangle, Plus, RefreshCcw} from "lucide-react";
    import {Button} from "@/components/ui/button";
    import {createDiscount, DiscountResponse, getDiscounts, deleteDiscount, updateDiscount} from "@/lib/actions/discountActions";
    import {toast} from "sonner";
    import {DiscountList} from "@/app/manage/organization/[organization_id]/event/_components/discounts/discount-list";
    import {DiscountRequest} from "@/lib/validators/event";
    import {
        FullDiscountFormView
    } from "@/app/manage/organization/[organization_id]/event/_components/discounts/full-discount-form-view";

    export default function DiscountManagementPage() {
        const {event, isLoading: isEventLoading} = useEventContext();
        const [discounts, setDiscounts] = useState<DiscountResponse[]>([]);
        const [isLoading, setIsLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);

        const [mode, setMode] = useState<'view' | 'create' | 'edit'>('view');
        const [editingDiscount, setEditingDiscount] = useState<DiscountResponse | null>(null);

        const pageSize = 1000;

        const fetchDiscounts = useCallback(async () => {
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
        }, [event?.id]);

        useEffect(() => {
            if (event?.id) {
                fetchDiscounts();
            }
        }, [event?.id, fetchDiscounts]);

        // --- Handlers ---

        const handleOpenCreateForm = () => {
            setEditingDiscount(null);
            setMode('create');
        };

        const handleOpenEditForm = (discount: DiscountResponse) => {
            setEditingDiscount(discount);
            setMode('edit');
        };

        const handleCancelForm = () => {
            setMode('view');
            setEditingDiscount(null);
        };



        const handleSaveDiscount = async (data: DiscountRequest) => {
            const action = mode === 'create'
                ? createDiscount(event!.id, data)
                : updateDiscount(event!.id, editingDiscount!.id, data);

            const toastId = toast.loading(`${mode === 'create' ? 'Creating' : 'Updating'} discount...`);
            try {
                await action;
                toast.success(`Discount ${mode === 'create' ? 'created' : 'updated'} successfully.`, {id: toastId});
                setMode('view'); // Return to list view on success
                fetchDiscounts();
            } catch (error) {
                console.error(`Failed to ${mode} discount`, error);
                toast.error(`Failed to ${mode} discount.`, {id: toastId});
            }
        };

        const handleToggleStatus = async (discountId: string) => {
            if (!event?.id) return;

            // 1. Save the original state in case we need to revert
            const originalDiscounts = [...discounts];
            const discountIndex = originalDiscounts.findIndex(d => d.id === discountId);
            if (discountIndex === -1) return;

            const discountToUpdate = originalDiscounts[discountIndex];
            const newStatus = !discountToUpdate.active;

            // 2. Optimistically update the UI immediately
            const newDiscounts = [...originalDiscounts];
            newDiscounts[discountIndex] = { ...discountToUpdate, active: newStatus };
            setDiscounts(newDiscounts);

            // 3. Send the request to the backend
            const toastId = toast.loading("Updating status...");
            try {
                await updateDiscount(event.id, discountId, { ...discountToUpdate, active: newStatus });
                toast.success("Status updated.", { id: toastId });
            } catch (err) {
                // 4. On failure, revert the state and show an error
                toast.error("Failed to update status.", { id: toastId });
                setDiscounts(originalDiscounts); // Revert to the original state
                console.error(err);
            }
        }

        const handleDeleteDiscount = async (discountId: string) => {
            if (!event?.id) return;

            // 1. Save original state and create the new state
            const originalDiscounts = [...discounts];
            const newDiscounts = originalDiscounts.filter(d => d.id !== discountId);

            // 2. Optimistically update the UI
            setDiscounts(newDiscounts);

            // 3. Send the request
            const toastId = toast.loading("Deleting discount...");
            try {
                await deleteDiscount(event.id, discountId);
                toast.success("Discount deleted successfully.", { id: toastId });
            } catch (err) {
                // 4. On failure, revert and show error
                toast.error("Failed to delete discount.", { id: toastId });
                setDiscounts(originalDiscounts); // Revert!
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

        // ✅ CONDITIONAL RENDERING: Show the FullDiscountFormView wrapper
        if (mode === 'create' || mode === 'edit') {
            return (
                <div className="p-4 md:p-8 w-full">
                    <div className="max-w-5xl mx-auto">
                        <FullDiscountFormView
                            tiers={event?.tiers || []}
                            sessions={event?.sessions || []}
                            onSave={handleSaveDiscount}
                            onBack={handleCancelForm}
                            isEditing={mode === 'edit'}
                            initialData={editingDiscount || undefined}
                        />
                    </div>
                </div>
            );
        }

        // Default: The List View
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
                                onClick={fetchDiscounts}
                                disabled={isLoading}
                            >
                                <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}/>
                                Refresh
                            </Button>
                            <Button onClick={handleOpenCreateForm}>
                                <Plus className="h-4 w-4"/>
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
                            <Button onClick={handleOpenCreateForm} variant="outline">
                                Create your first discount
                            </Button>
                        </div>
                    ) : (
                        <DiscountList
                            discounts={discounts}
                            onEdit={handleOpenEditForm}
                            onDelete={handleDeleteDiscount}
                            tiers={event.tiers || []}
                            sessions={event.sessions || []}
                            onToggleStatus={handleToggleStatus}
                        />
                    )}
                </div>
            </div>
        );
    }
