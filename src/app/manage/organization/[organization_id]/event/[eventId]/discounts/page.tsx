"use client";

import {useState, useEffect} from "react";
import {useEventContext} from "@/providers/EventProvider";
import {Skeleton} from "@/components/ui/skeleton";
import {AlertTriangle, Plus, RefreshCcw} from "lucide-react";
import {Button} from "@/components/ui/button";
import {DiscountResponse, getDiscounts} from "@/lib/actions/discountActions";
import {toast} from "sonner";
import {
    DiscountCodeForm
} from "@/app/manage/organization/[organization_id]/event/_components/discounts/discount-code-form";
import {DiscountList} from "@/app/manage/organization/[organization_id]/event/_components/discounts/discount-list";


// Define possible interaction modes
type InteractionMode = "view" | "create" | "edit";

export default function DiscountManagementPage() {
    const {event, isLoading: isEventLoading} = useEventContext();
    const [discounts, setDiscounts] = useState<DiscountResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<InteractionMode>("view");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingDiscountId, setEditingDiscountId] = useState<string | null>(null);
    const [currentDiscount, setCurrentDiscount] = useState<DiscountResponse | null>(null);
    const pageSize = 1000; // Large enough to fetch all

    const fetchDiscounts = async () => {
        if (!event?.id) return;

        try {
            setIsLoading(true);
            setError(null);

            const response = await getDiscounts(event.id, true, 0, pageSize);
            setDiscounts(response || []);
        } catch (err) {
            setError("Failed to load discounts. Please try again.");
            console.error(err);
            toast.error("Failed to load discounts.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (event?.id) {
            fetchDiscounts();
        }
    }, [event?.id]);

    const handleCreateDiscount = () => {
        setCurrentDiscount(null);
        setMode("create");
        setIsCreateDialogOpen(true);
    };

    const handleEditDiscount = (discountIndex: number) => {
        const discountToEdit = discounts[discountIndex];
        setMode("edit");
    };

    const handleCancelEdit = () => {
        setMode("view");
        setEditingDiscountId(null);
        setCurrentDiscount(null);
    };

    const handleDiscountCreated = () => {
        setIsCreateDialogOpen(false);
        fetchDiscounts();
        toast.success("Discount created successfully.");
    };

    const handleDiscountUpdated = () => {
        setMode("view");
        setEditingDiscountId(null);
        fetchDiscounts();
        toast.success("Discount updated successfully.");
    };

    const handleDiscountDeleted = (discountIndex: number) => {
        fetchDiscounts();
        toast.success("Discount deleted successfully.");
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
                            disabled={isLoading || mode === "edit"}
                        >
                            <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}/>
                            Refresh
                        </Button>
                        <Button
                            onClick={handleCreateDiscount}
                            disabled={mode === "edit"}
                        >
                            <Plus className="h-4 w-4 mr-2"/>
                            New Discount
                        </Button>
                    </div>
                </div>

                {mode === "create" && (
                    <div className="mb-6 p-4 border rounded-md bg-muted/30">
                        <h2 className="text-xl font-medium mb-4">Create New Discount</h2>
                        <DiscountCodeForm
                            tiers={event.tiers || []}
                            sessions={event.sessions || []}
                            onSave={handleDiscountCreated}
                        />
                    </div>
                )}

                {error ? (
                    <div className="p-4 border border-destructive/50 rounded-md bg-destructive/10 text-destructive">
                        {error}
                    </div>
                ) : isLoading ? (
                    <Skeleton className="h-64 w-full"/>
                ) : discounts.length === 0 && mode === "view" ? (
                    <div className="text-center p-8 border rounded-md">
                        <p className="mb-4">No discounts found</p>
                        <Button onClick={handleCreateDiscount} variant="outline">
                            Create your first discount
                        </Button>
                    </div>
                ) : (
                    <DiscountList
                        discounts={discounts}
                        tiers={event.tiers || []}
                        sessions={event.sessions || []}
                        onEdit={handleEditDiscount}
                        onDelete={handleDiscountDeleted}
                    />
                )}
            </div>
        </div>
    );
}
