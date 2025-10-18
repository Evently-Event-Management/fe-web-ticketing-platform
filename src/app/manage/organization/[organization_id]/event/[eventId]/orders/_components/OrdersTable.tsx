"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis,
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Eye } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Define a simplified order interface for the table
interface OrderDetails {
  order_id: string;
  user_id: string;
  username: string;
  email: string;
  order_date: string;
  status: 'pending' | 'completed' | 'cancelled';
  total_price: number;
  total_tickets: number;
  session_id?: string;
  session_name?: string;
}

interface OrdersTableProps {
  orders: OrderDetails[];
  isLoading: boolean;
  onStatusChange: (status: string) => void;
  onViewOrder: (orderId: string) => void;
  totalOrders: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const OrdersTable = ({
  orders,
  isLoading,
  onStatusChange,
  onViewOrder,
  totalOrders,
  page,
  pageSize,
  onPageChange,
}: OrdersTableProps) => {

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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Event Orders</h2>
          <p className="text-sm text-muted-foreground">Manage and view all orders for this event</p>
        </div>
        <Select defaultValue="all" onValueChange={onStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Tickets</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Loading orders...
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.order_id}>
                    <TableCell className="font-medium">
                      {order.order_id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>{order.username || order.email}</TableCell>
                    <TableCell>
                      {new Date(order.order_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(order.total_price, "LKR", 'en-LK')}</TableCell>
                    <TableCell>{order.total_tickets}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewOrder(order.order_id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {totalOrders > 0 && (
          <div className="flex items-center justify-end space-x-2 py-4 mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => onPageChange(page > 1 ? page - 1 : 1)}
                    className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {(() => {
                  const totalPages = Math.ceil(totalOrders / pageSize);
                  let pageNumbers: number[] = [];
                  
                  if (totalPages <= 5) {
                    // Show all pages if 5 or fewer
                    pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
                  } else {
                    // Always show first page
                    pageNumbers.push(1);
                    
                    // Current page neighborhood
                    const startPage = Math.max(2, page - 1);
                    const endPage = Math.min(totalPages - 1, page + 1);
                    
                    // Add ellipsis if needed before current range
                    if (startPage > 2) {
                      pageNumbers.push(-1); // -1 represents ellipsis
                    }
                    
                    // Add pages around current page
                    for (let i = startPage; i <= endPage; i++) {
                      pageNumbers.push(i);
                    }
                    
                    // Add ellipsis if needed after current range
                    if (endPage < totalPages - 1) {
                      pageNumbers.push(-2); // -2 represents ellipsis
                    }
                    
                    // Always show last page
                    if (totalPages > 1) {
                      pageNumbers.push(totalPages);
                    }
                  }
                  
                  return pageNumbers.map((pageNum, index) => (
                    <PaginationItem key={index}>
                      {pageNum < 0 ? (
                        // Ellipsis
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          onClick={() => onPageChange(pageNum)}
                          isActive={page === pageNum}
                        >
                          {pageNum}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ));
                })()}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => onPageChange(page < Math.ceil(totalOrders / pageSize) ? page + 1 : page)}
                    className={page >= Math.ceil(totalOrders / pageSize) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
    </div>
  );
};

export default OrdersTable;