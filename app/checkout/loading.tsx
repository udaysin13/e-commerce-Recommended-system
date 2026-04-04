import { Skeleton } from "@/src/components/ui/skeleton"

export default function CheckoutLoading() {
  return (
    <main className="page-shell py-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <div className="surface-panel rounded-[2rem] p-6">
            <Skeleton className="h-10 w-56 bg-white/8" />
            <Skeleton className="mt-4 h-5 w-full max-w-xl bg-white/8" />
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-24 w-full rounded-[1.5rem] bg-white/8" />
            <Skeleton className="h-24 w-full rounded-[1.5rem] bg-white/8" />
            <Skeleton className="h-24 w-full rounded-[1.5rem] bg-white/8" />
          </div>
          <div className="mt-8 space-y-5">
            <Skeleton className="h-56 w-full rounded-[2rem] bg-white/8" />
            <Skeleton className="h-48 w-full rounded-[2rem] bg-white/8" />
            <div className="flex gap-3">
              <Skeleton className="h-12 w-44 rounded-full bg-white/8" />
              <Skeleton className="h-12 w-44 rounded-full bg-white/8" />
            </div>
          </div>
        </div>
        <Skeleton className="min-h-[720px] w-full rounded-[2rem] bg-white/8" />
      </div>
    </main>
  )
}
