import { Skeleton } from '@/components/ui/skeleton';

export default function SessionDetailsLoading() {
  return (
    <>
      {/* Session Details Header Skeleton */}
      <section className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-3/4 max-w-2xl" />
            
            <div className="flex flex-wrap gap-2 mt-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-32 rounded-full" />
            </div>
            
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-40" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-28" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Session Booking Skeleton */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Session Description */}
            <div className="bg-card border rounded-lg p-6 space-y-4">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            
            {/* Seating Layout or Ticket Selection */}
            <div className="bg-card border rounded-lg p-6">
              <Skeleton className="h-7 w-48 mb-4" />
              <div className="aspect-video w-full bg-muted/50 rounded-md relative overflow-hidden">
                <Skeleton className="h-full w-full" />
              </div>
              
              {/* Ticket Types */}
              <div className="mt-6 space-y-4">
                <Skeleton className="h-7 w-40" />
                
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-md">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-10 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border rounded-lg p-6 sticky top-8">
              <Skeleton className="h-7 w-36 mb-4" />
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-24" />
                </div>
                
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-20" />
                </div>
                
                <div className="border-t pt-4 flex justify-between items-center">
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-6 w-24" />
                </div>
                
                <div className="pt-4">
                  <Skeleton className="h-12 w-full rounded-md" />
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}