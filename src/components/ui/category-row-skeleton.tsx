import { Skeleton } from '@/components/ui/skeleton'
import { MovieCardSkeleton } from './movie-card-skeleton'

export function CategoryRowSkeleton() {
  return (
    <section className="py-6 md:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-3 mb-5">
          <Skeleton className="w-8 h-8 rounded-lg bg-white/10" />
          <Skeleton className="h-6 w-48 bg-white/10" />
          <Skeleton className="h-5 w-12 rounded-full bg-white/10" />
        </div>

        {/* Cards Row Skeleton */}
        <div className="flex gap-4 overflow-x-hidden pb-4">
          {[...Array(8)].map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
