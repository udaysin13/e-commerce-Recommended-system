import type { ProductReviewSummary as ProductReviewSummaryType } from "@/types/ai";

export const ProductReviewSummary = ({
  summary,
}: {
  summary: ProductReviewSummaryType | null;
}) => {
  if (!summary || !summary.hasReviewData) {
    return (
      <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
        <div className="rounded border border-line bg-white p-5">
          <p className="text-sm font-semibold uppercase text-teal">AI Review Summary</p>
          <p className="mt-3 text-sm leading-6 text-ink/65">
            Review summary will appear here once enough customer feedback is available.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
      <div className="rounded border border-line bg-white p-5">
        <p className="text-sm font-semibold uppercase text-teal">AI Review Summary</p>
        <p className="mt-3 text-base leading-7 text-ink">{summary.summary}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded bg-mist/70 p-4">
            <p className="text-xs font-semibold uppercase text-ink/45">Pros</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {summary.pros.length > 0 ? summary.pros.map((item) => (
                <span key={item} className="rounded bg-white px-3 py-2 text-xs font-bold text-ink/75">
                  {item}
                </span>
              )) : <span className="text-sm text-ink/55">No strong positives captured yet.</span>}
            </div>
          </div>
          <div className="rounded bg-mist/70 p-4">
            <p className="text-xs font-semibold uppercase text-ink/45">Cons</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {summary.cons.length > 0 ? summary.cons.map((item) => (
                <span key={item} className="rounded bg-white px-3 py-2 text-xs font-bold text-ink/75">
                  {item}
                </span>
              )) : <span className="text-sm text-ink/55">No common complaints captured yet.</span>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
