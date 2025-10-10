"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Copy, Check } from "lucide-react";
import { OrderDetailsResponse } from "@/lib/actions/analyticsActions";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

interface OrderDetailViewProps {
  isOpen: boolean;
  onClose: () => void;
  orderDetails: OrderDetailsResponse | null;
}

// Copy button component
const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      toast.error("Failed to copy text");
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="h-6 w-6 p-0 ml-1" 
      onClick={handleCopy}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
};

const OrderDetailView = ({
  isOpen,
  onClose,
  orderDetails,
}: OrderDetailViewProps) => {
  if (!orderDetails) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const formattedDate = new Date(orderDetails.CreatedAt).toLocaleString();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] w-[90vw] md:max-w-[1200px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription className="flex items-center">
            Order #{orderDetails.OrderID}
            <CopyButton text={orderDetails.OrderID} />
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto pr-1" style={{ maxHeight: "calc(90vh - 120px)" }}>
          <div className="space-y-6">
          {/* Order Summary */}
          <div>
            <h3 className="text-lg font-medium mb-2">Order Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-medium">{formattedDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={getStatusColor(orderDetails.Status)}>
                  {orderDetails.Status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subtotal</p>
                <p className="font-medium">{formatCurrency(orderDetails.SubTotal)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Price</p>
                <p className="font-medium">{formatCurrency(orderDetails.Price)}</p>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <div className="flex items-center bg-muted/30 p-1 rounded">
                  <p className="font-mono text-xs overflow-auto whitespace-nowrap">{orderDetails.OrderID}</p>
                  <CopyButton text={orderDetails.OrderID} />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <div className="flex items-center bg-muted/30 p-1 rounded">
                  <p className="font-mono text-xs overflow-auto whitespace-nowrap">{orderDetails.UserID}</p>
                  <CopyButton text={orderDetails.UserID} />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Discount Information (if applicable) */}
          {orderDetails.DiscountCode && (
            <div>
              <h3 className="text-lg font-medium">Discount Applied</h3>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-sm text-muted-foreground">Discount Code</p>
                  <p className="font-medium">{orderDetails.DiscountCode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Discount Amount</p>
                  <p className="font-medium">
                    {formatCurrency(orderDetails.DiscountAmount)}
                  </p>
                </div>
              </div>
              <Separator className="my-4" />
            </div>
          )}

          {/* Ticket Details */}
          <div>
            <h3 className="text-lg font-medium mb-2">Tickets ({orderDetails.tickets.length})</h3>
            <div className="rounded-md border overflow-x-auto overflow-y-auto max-h-[400px]">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="min-w-[280px] md:w-1/3">Ticket ID</TableHead>
                    <TableHead className="min-w-[100px] md:w-1/6">Seat</TableHead>
                    <TableHead className="min-w-[100px] md:w-1/6">Tier</TableHead>
                    <TableHead className="min-w-[100px] md:w-1/6">Price</TableHead>
                    <TableHead className="min-w-[100px] md:w-1/6">Checked In</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderDetails.tickets.map((ticket) => (
                    <TableRow key={ticket.ticket_id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center bg-muted/30 p-1 rounded">
                          <span className="font-mono text-xs overflow-auto whitespace-nowrap">
                            {ticket.ticket_id}
                          </span>
                          <CopyButton text={ticket.ticket_id} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{backgroundColor: ticket.colour || '#888888'}}
                          />
                          {ticket.seat_label}
                        </div>
                      </TableCell>
                      <TableCell>{ticket.tier_name}</TableCell>
                      <TableCell>{formatCurrency(ticket.price_at_purchase)}</TableCell>
                      <TableCell>
                        <Badge variant={ticket.checked_in ? "default" : "outline"}>
                          {ticket.checked_in ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailView;