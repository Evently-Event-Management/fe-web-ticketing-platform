"use client";

import { useState, useEffect } from "react";
import { useEventContext } from "@/providers/EventProvider";
import { useSearchParams, useRouter } from "next/navigation";
import { getEventOrderDetails, OrderDetailsResponse } from "@/lib/actions/analyticsActions";
import OrdersTable from "./_components/OrdersTable";
import OrderDetailView from "./_components/OrderDetailView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// Transform OrderDetailsResponse to the simplified OrderDetails for the table
const transformOrderData = (data: OrderDetailsResponse[]) => {
  return data.map(order => ({
    order_id: order.OrderID,
    user_id: order.UserID,
    username: `User ${order.UserID.substring(0, 5)}...`, // Simplified for display
    email: `user${order.UserID.substring(0, 5)}@example.com`, // Placeholder email
    order_date: order.CreatedAt,
    status: order.Status,
    total_price: order.Price,
    total_tickets: order.tickets.length,
    session_id: order.SessionID,
  }));
};

export default function OrdersPage() {
  const { event } = useEventContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<OrderDetailsResponse[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetailsResponse | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [totalOrders, setTotalOrders] = useState(0);

  // Get session ID from URL if present
  useEffect(() => {
    const sessionId = searchParams.get("sessionId");
    if (sessionId) {
      setCurrentSession(sessionId);
    }
  }, [searchParams]);

  // Fetch orders when component mounts or filters change
  useEffect(() => {
    const fetchOrders = async () => {
      if (!event?.id) return;
      
      setIsLoading(true);
      try {
        const options: {
          limit: number;
          offset: number;
          status?: 'pending' | 'completed' | 'cancelled';
          sessionId?: string;
        } = {
          limit: pageSize,
          offset: (currentPage - 1) * pageSize
        };
        
        // Apply filters
        if (statusFilter !== "all") {
          options.status = statusFilter as 'pending' | 'completed' | 'cancelled';
        }
        
        if (currentSession) {
          options.sessionId = currentSession;
        }
        
        const data = await getEventOrderDetails(event.id, options);
        
        // If the response is an array, use it directly
        if (Array.isArray(data)) {
          setOrders(data);
          setTotalOrders(data.length > 0 && data[0].TotalCount ? data[0].TotalCount : data.length);
        } else if (data) {
          // Handle single object response
          setOrders([data as OrderDetailsResponse]);
          setTotalOrders((data as OrderDetailsResponse).TotalCount || 1);
        } else {
          setOrders([]);
          setTotalOrders(0);
        }
        
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        toast.error("Failed to fetch orders. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, [event?.id, statusFilter, currentSession, currentPage, pageSize]);

  // Handle view order
  const handleViewOrder = (orderId: string) => {
    const order = orders.find(o => o.OrderID === orderId);
    if (order) {
      setSelectedOrder(order);
      setShowOrderDetail(true);
    }
  };

  // Handle status filter change
  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    // Reset to first page when changing filters
    setCurrentPage(1);
  };

  // Handle session filter
  const handleSessionChange = (sessionId: string | null) => {
    setCurrentSession(sessionId);
    // Reset to first page when changing sessions
    setCurrentPage(1);
    
    // Update URL with session ID or remove it
    if (sessionId) {
      router.push(`?sessionId=${sessionId}`);
    } else {
      router.push('');
    }
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Order Management</h1>
            <p className="text-muted-foreground">
              View and manage orders for {event?.title}
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger 
              value="all" 
              onClick={() => handleSessionChange(null)}
              className="flex-1"
            >
              All Sessions
            </TabsTrigger>
            {event?.sessions && event.sessions.map((session) => (
              <TabsTrigger 
                key={session.id} 
                value={session.id}
                onClick={() => handleSessionChange(session.id)}
                className="flex-1"
              >
                {new Date(session.startTime).toLocaleDateString()}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <OrdersTable
              orders={transformOrderData(orders)}
              isLoading={isLoading}
              onStatusChange={handleStatusChange}
              onViewOrder={handleViewOrder}
              totalOrders={totalOrders}
              page={currentPage}
              pageSize={pageSize}
              onPageChange={handlePageChange}
            />
          </TabsContent>
          
          {event?.sessions && event.sessions.map((session) => (
            <TabsContent key={session.id} value={session.id} className="mt-6">
              <OrdersTable
                orders={transformOrderData(orders)}
                isLoading={isLoading}
                onStatusChange={handleStatusChange}
                onViewOrder={handleViewOrder}
                totalOrders={totalOrders}
                page={currentPage}
                pageSize={pageSize}
                onPageChange={handlePageChange}
              />
            </TabsContent>
          ))}
        </Tabs>
        
        <OrderDetailView
          isOpen={showOrderDetail}
          onClose={() => setShowOrderDetail(false)}
          orderDetails={selectedOrder}
        />
      </div>
    </div>
  );
}