import { Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function FullPageLoader() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
      <p className="text-sm text-muted-foreground animate-pulse">Loading FINN...</p>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-[120px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
    </div>
  )
}

export function SkeletonChart() {
  const heights = [40, 75, 30, 90, 50, 85, 25, 60, 45, 80, 35, 70]
  
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col gap-4">
      <Skeleton className="h-6 w-[150px]" />
      <div className="flex items-end gap-2 h-[250px] pt-4">
        {heights.map((h, i) => (
          <Skeleton
            key={i}
            className="w-full bg-violet-100 dark:bg-violet-900/20"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  )
}
