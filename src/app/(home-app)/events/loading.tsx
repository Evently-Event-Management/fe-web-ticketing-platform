import { Skeleton } from '@/components/ui/skeleton';

export default function EventsLoading() {
  return (
    <main>
      {/* HERO SECTION SKELETON */}
      <section className="relative bg-background">
        <div className="bg-muted absolute inset-0 h-[450px] w-full">
          <Skeleton className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent dark:from-background dark:via-background/80 dark:to-black/30" />
        </div>

        <div className="relative pt-24 pb-32 px-4 flex flex-col items-center justify-center min-h-[450px]">
          <div className="text-center mb-8">
            <Skeleton className="h-14 w-80 md:w-96 mx-auto mb-4 bg-white/30 dark:bg-white/10" />
            <Skeleton className="h-6 w-full max-w-md mx-auto bg-white/30 dark:bg-white/10" />
          </div>

          <div className="w-full max-w-3xl">
            <Skeleton className="h-16 w-full rounded-full" />
          </div>
        </div>
      </section>

      {/* FILTER BAR SKELETON */}
      <section className="md:max-w-7xl mx-auto px-4 py-8 space-y-10">
        <div className="flex items-center gap-2 overflow-x-auto pb-6">
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-40 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>

        {/* RESULTS SKELETON */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-card overflow-hidden rounded-xl border shadow-sm">
              <Skeleton className="h-48 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <div className="pt-2">
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION SKELETON */}
        <div className="flex justify-center mt-10">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
        </div>
      </section>
    </main>
  );
}