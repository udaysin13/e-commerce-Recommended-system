export default function LoadingGrid({ count = 8 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
        >
          {/* Header Gradient Placeholder */}
          <div className="h-40 bg-gradient-to-br from-slate-200 to-slate-300" />

          {/* Content Placeholder */}
          <div className="space-y-3 p-5">
            <div className="h-3 rounded-full bg-slate-200" />
            <div className="h-3 w-3/4 rounded-full bg-slate-200" />
            <div className="space-y-2 pt-2">
              <div className="h-2 rounded-full bg-slate-100" />
              <div className="h-2 w-5/6 rounded-full bg-slate-100" />
            </div>
          </div>

          {/* Footer Placeholder */}
          <div className="flex items-center justify-between gap-3 border-t border-stone-100 px-5 py-4">
            <div className="h-6 w-16 rounded-full bg-slate-200" />
            <div className="h-9 w-16 rounded-full bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
