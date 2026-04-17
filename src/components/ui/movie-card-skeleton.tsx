import { Skeleton } from '@/components/ui/skeleton'

export function MovieCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[150px] sm:w-[170px] md:w-[180px] snap-center">
      <Skeleton className="aspect-[2/3] w-full rounded-xl bg-white/5" />
      <div className="mt-3 space-y-2 px-1">
        <Skeleton className="h-4 w-full rounded bg-white/10" />
        <Skeleton className="h-3 w-2/3 rounded bg-white/10" />
        <Skeleton className="h-3 w-1/3 rounded bg-white/10" />
      </div>
    </div>
  )
}
