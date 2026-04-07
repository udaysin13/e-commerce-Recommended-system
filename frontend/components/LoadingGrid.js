export default function LoadingGrid({ count = 4 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="panel overflow-hidden p-4">
          <div className="skeleton h-48 rounded-[22px]" />
          <div className="skeleton mt-4 h-4 rounded-full" />
          <div className="skeleton mt-2 h-4 w-3/4 rounded-full" />
          <div className="skeleton mt-6 h-11 rounded-full" />
        </div>
      ))}
    </div>
  );
}
