import { Skeleton } from "@/src/components/ui/skeleton"

export default function Loading() {
  return (
    <main className="page-shell py-8">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="surface-panel rounded-[2rem] p-6">
          <Skeleton className="h-8 w-44 bg-white/8" />
          <Skeleton className="mt-5 h-16 w-full max-w-2xl bg-white/8" />
          <Skeleton className="mt-4 h-6 w-full max-w-xl bg-white/8" />
          <div className="mt-6 flex gap-3">
            <Skeleton className="h-12 w-44 rounded-full bg-white/8" />
            <Skeleton className="h-12 w-36 rounded-full bg-white/8" />
          </div>
          <div className="mt-6 flex gap-3">
            <Skeleton className="h-9 w-32 rounded-full bg-white/8" />
            <Skeleton className="h-9 w-32 rounded-full bg-white/8" />
            <Skeleton className="h-9 w-32 rounded-full bg-white/8" />
          </div>
        </div>
        <div className="surface-panel rounded-[2rem] p-4">
          <Skeleton className="aspect-[4/3] w-full rounded-[1.5rem] bg-white/8" />
          <Skeleton className="mt-4 h-24 w-full rounded-[1.25rem] bg-white/8" />
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="surface-card overflow-hidden">
            <Skeleton className="aspect-[4/4.8] w-full bg-slate-200" />
            <div className="space-y-4 p-4">
              <Skeleton className="h-3 w-28 bg-slate-200" />
              <Skeleton className="h-5 w-4/5 bg-slate-200" />
              <Skeleton className="h-4 w-full bg-slate-200" />
              <Skeleton className="h-11 w-full rounded-full bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
