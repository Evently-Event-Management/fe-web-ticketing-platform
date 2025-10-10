"use client";

import { useState } from "react";
import { TierDTO } from "@/lib/validators/event";
import { useEventContext } from "@/providers/EventProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Edit, Plus, Trash2 } from "lucide-react";
import TierFormDialog from "./TierFormDialog";
import { deleteTier } from "@/lib/actions/eventActions";
import { toast } from "sonner";

const TierManagement = () => {
  const { event, refetchEventData } = useEventContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<TierDTO | null>(null);
  const [tierToDelete, setTierToDelete] = useState<TierDTO | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateTier = () => {
    setSelectedTier(null);
    setIsDialogOpen(true);
  };

  const handleEditTier = (tier: TierDTO) => {
    setSelectedTier(tier);
    setIsDialogOpen(true);
  };

  const handleDeleteTier = (tier: TierDTO) => {
    setTierToDelete(tier);
  };

  const handleConfirmDelete = async () => {
    if (!tierToDelete || !event) return;
    
    setIsDeleting(true);
    try {
      await deleteTier(event.id, tierToDelete.id);
      toast.success(`Tier "${tierToDelete.name}" deleted successfully`);
      await refetchEventData();
    } catch (error) {
      console.error("Failed to delete tier:", error);
      toast.error("Failed to delete tier. It may be in use by tickets or discounts.");
    } finally {
      setIsDeleting(false);
      setTierToDelete(null);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedTier(null);
  };

  const handleSuccess = async () => {
    await refetchEventData();
    setIsDialogOpen(false);
    setSelectedTier(null);
  };

  if (!event) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Ticket Tiers</h3>
          <p className="text-sm text-muted-foreground">Manage price tiers for your event</p>
        </div>
        <Button type="button" onClick={handleCreateTier}>
          <Plus className="h-4 w-4 mr-2" />
          New Tier
        </Button>
      </div>

      {event.tiers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <div className="py-8">
              <p className="mb-2 text-muted-foreground">No tiers have been created yet</p>
              <Button type="button" variant="outline" onClick={handleCreateTier} className="mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Create your first tier
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {event.tiers.map((tier) => (
            <div key={tier.id} className="rounded-lg border overflow-hidden flex flex-col bg-card">
              <div
                className="h-2"
                style={{ backgroundColor: tier.color || '#6b7280' }}
              />
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold line-clamp-1">{tier.name}</h3>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      type="button"
                      onClick={() => handleEditTier(tier)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteTier(tier)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  {tier.color && (
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: tier.color }}
                      />
                      <span className="font-mono text-xs">{tier.color}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-bold">LKR {tier.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <TierFormDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        tier={selectedTier}
        onSuccess={handleSuccess}
        eventId={event.id}
      />

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!tierToDelete} onOpenChange={(open) => !open && setTierToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the tier "{tierToDelete?.name}"?
              {tierToDelete?.price && tierToDelete.price > 0 && (
                <p className="mt-2 font-medium text-destructive">
                  This tier is priced at LKR {tierToDelete.price.toFixed(2)}. This action cannot be undone.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TierManagement;