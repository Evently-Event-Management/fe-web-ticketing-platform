import { Skeleton } from '@/components/ui/skeleton';

export default function HomeLoading() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Skeleton className="h-14 w-3/4 mx-auto mb-4" />
            <Skeleton className="h-6 w-2/3 mx-auto mb-8" />
            <div className="flex justify-center mb-10">
              <Skeleton className="h-12 w-40 mx-2 rounded-md" />
              <Skeleton className="h-12 w-40 mx-2 rounded-md" />
            </div>
            <div className="relative mx-auto w-full max-w-3xl">
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 sm:py-16 md:py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center md:items-start justify-between gap-6 mb-8 sm:mb-12 md:mb-16 text-center md:text-left">
            <Skeleton className="h-10 w-64 mb-4" />
            <Skeleton className="h-5 w-full md:w-1/2 mb-4" />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="relative">
                <Skeleton className="aspect-square rounded-lg mb-3" />
                <Skeleton className="h-5 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Events Section */}
      <section className="py-12 sm:py-16 md:py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center md:items-start md:flex-row justify-between gap-6 mb-8 sm:mb-12 md:mb-16 text-center md:text-left">
            <div>
              <Skeleton className="h-10 w-64 mb-4" />
              <Skeleton className="h-5 w-full md:w-96 mb-2" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card overflow-hidden rounded-xl border shadow-sm">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="pt-2">
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section className="py-12 sm:py-16 md:py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <Skeleton className="h-10 w-64 mx-auto mb-6" />
          <Skeleton className="h-5 w-full md:w-1/2 mx-auto mb-12 text-center" />
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden border shadow-sm">
                <Skeleton className="h-40 w-full" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 sm:py-24 md:py-32 overflow-hidden">
        <div className="bg-primary w-full h-full absolute inset-0"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <Skeleton className="h-10 w-3/4 mx-auto mb-6 bg-primary-foreground/30" />
            <Skeleton className="h-5 w-full mx-auto mb-8 bg-primary-foreground/30" />
            <Skeleton className="h-12 w-48 mx-auto rounded-md bg-primary-foreground/30" />
          </div>
        </div>
      </section>
    </main>
  );
}