import { Skeleton } from '@/components/ui/skeleton';

export default function EventDetailsLoading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Event Header Skeleton */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <Skeleton className="h-64 md:h-80 w-full md:w-1/3 rounded-lg" />
        
        <div className="w-full md:w-2/3 space-y-4">
          <Skeleton className="h-10 w-3/4" />
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
          
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-24 w-full" />
          
          <div className="flex gap-4 mt-6">
            <Skeleton className="h-10 w-32 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
        </div>
      </div>
      
      {/* Session List Skeleton */}
      <div className="my-8">
        <Skeleton className="h-10 w-48 mb-6" />
        
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-6 bg-card">
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="space-y-3">
                  <Skeleton className="h-7 w-60" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="h-5 w-40" />
                </div>
                
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-24 rounded-md" />
                  <Skeleton className="h-10 w-32 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Event Details Skeleton */}
      <div className="my-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
          
          <div className="space-y-3">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}