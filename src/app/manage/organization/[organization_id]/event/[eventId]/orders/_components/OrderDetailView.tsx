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
// No icons needed
import { OrderDetailsResponse } from "@/lib/actions/analyticsActions";
import { formatCurrency } from "@/lib/utils";

interface OrderDetailViewProps {
  isOpen: boolean;
  onClose: () => void;
  orderDetails: OrderDetailsResponse | null;
}

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
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            Order #{orderDetails.OrderID.substring(0, 8)}...
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
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
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Seat</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Checked In</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderDetails.tickets.map((ticket) => (
                    <TableRow key={ticket.ticket_id}>
                      <TableCell className="font-medium">
                        {ticket.ticket_id.substring(0, 8)}...
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
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailView;