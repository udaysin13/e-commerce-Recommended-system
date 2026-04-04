import { Skeleton } from "@/src/components/ui/skeleton"

export default function ProductDetailLoading() {
  return (
    <main className="page-shell py-8">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <Skeleton className="aspect-[4/3] w-full rounded-[2rem] bg-white/8" />
          <div className="grid grid-cols-4 gap-3">
            <Skeleton className="h-24 w-full rounded-[1rem] bg-white/8" />
            <Skeleton className="h-24 w-full rounded-[1rem] bg-white/8" />
            <Skeleton className="h-24 w-full rounded-[1rem] bg-white/8" />
            <Skeleton className="h-24 w-full rounded-[1rem] bg-white/8" />
          </div>
        </div>
        <div className="space-y-5 surface-panel rounded-[2rem] p-6">
          <Skeleton className="h-4 w-28 bg-white/8" />
          <Skeleton className="h-14 w-full bg-white/8" />
          <Skeleton className="h-6 w-52 bg-white/8" />
          <Skeleton className="h-24 w-full bg-white/8" />
          <Skeleton className="h-28 w-full bg-white/8" />
        </div>
      </div>
    </main>
  )
}
