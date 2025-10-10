"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { TierDTO } from "@/lib/validators/event";
import { createTier, updateTier } from "@/lib/actions/eventActions";

interface TierFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tier?: TierDTO | null;
  onSuccess: () => Promise<void>;
  eventId: string;
}

// Define the validation schema
const tierFormSchema = z.object({
  name: z.string().min(1, { message: "Tier name is required" }),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6})$/, {
      message: "Color must be a valid hex color code (e.g., #FF5733)",
    }),
  price: z.number().min(0, { message: "Price cannot be negative" }),
});

// Create a TypeScript type from the schema
type FormValues = z.infer<typeof tierFormSchema>;

const TierFormDialog = ({
  isOpen,
  onClose,
  tier,
  onSuccess,
  eventId,
}: TierFormDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!tier;

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(tierFormSchema),
    defaultValues: {
      name: "",
      color: "#6D28D9", // Default color (purple)
      price: 0,
    },
  });

  // Reset form when tier changes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: tier?.name || "",
        color: tier?.color || "#6D28D9",
        price: tier?.price || 0,
      });
    }
  }, [form, tier, isOpen]);

  // Define submit handler that will be called when the button is clicked
  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditing && tier) {
        // Use the real updateTier API with proper typing
        await updateTier(eventId, tier.id, {
          name: values.name,
          color: values.color,
          price: values.price
        });
        toast.success("Tier updated successfully");
      } else {
        // Use the real createTier API with proper typing
        await createTier(eventId, {
          name: values.name,
          color: values.color,
          price: values.price
        });
        toast.success("Tier created successfully");
      }
      await onSuccess();
      onClose(); // Close the dialog on success
    } catch (error) {
      console.error("Failed to save tier:", error);
      toast.error(`Failed to ${isEditing ? "update" : "create"} tier`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Tier" : "Create New Tier"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the ticket tier details below"
              : "Create a new ticket tier for your event"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <div className="space-y-4" onKeyDown={(e) => {
            // Prevent form submission when Enter is pressed in input fields
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., VIP, Standard, Early Bird" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        {...field}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        type="text"
                        placeholder="#RRGGBB"
                        {...field}
                        onChange={(e) => {
                          let value = e.target.value;
                          if (!value.startsWith('#')) {
                            value = `#${value.replace(/[^A-Fa-f0-9]/g, '')}`;
                          }
                          if (value.length > 7) {
                            value = value.slice(0, 7);
                          }
                          field.onChange(value);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        LKR
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-11" // Adjusted padding for the 'LKR' sign
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Handle empty string case to avoid NaN issues
                          field.onChange(value === '' ? '' : parseFloat(value));
                        }}
                      // value is handled by {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                disabled={isSubmitting}
                onClick={() => {
                  form.handleSubmit(handleSubmit)();
                }}
              >
                {isSubmitting
                  ? isEditing
                    ? "Updating..."
                    : "Creating..."
                  : isEditing
                    ? "Update Tier"
                    : "Create Tier"}
              </Button>
            </DialogFooter>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TierFormDialog;

