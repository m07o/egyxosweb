import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      <main className="flex-1 pt-16">
        {/* Hero Slider Skeleton */}
        <div className="relative w-full h-[55vh] min-h-[380px] md:h-[70vh] md:min-h-[500px] lg:h-[80vh] lg:min-h-[600px] overflow-hidden">
          <Skeleton className="absolute inset-0 bg-white/5" />
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/50 to-transparent z-10" />
          <div className="absolute bottom-12 md:bottom-20 left-4 sm:left-6 z-20 space-y-4">
            <Skeleton className="h-12 w-72 max-w-full bg-white/10" />
            <Skeleton className="h-4 w-96 max-w-full bg-white/10" />
            <div className="flex gap-3 pt-4">
              <Skeleton className="h-10 w-32 bg-white/20" />
              <Skeleton className="h-10 w-32 bg-white/10" />
            </div>
          </div>
        </div>

        {/* Categories Section Skeleton */}
        <section className="py-6 md:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
            {[...Array(4)].map((_, rowIndex) => (
              <div key={rowIndex}>
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                  <Skeleton className="w-8 h-8 rounded-lg bg-white/10" />
                  <Skeleton className="h-6 w-40 bg-white/10" />
                </div>

                {/* Cards Row */}
                <div className="flex gap-4 overflow-hidden">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-[150px] sm:w-[170px] md:w-[180px]">
                      <Skeleton className="aspect-[2/3] rounded-xl bg-white/5" />
                      <div className="mt-3 space-y-2">
                        <Skeleton className="h-4 w-full rounded bg-white/10" />
                        <Skeleton className="h-3 w-2/3 rounded bg-white/10" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
