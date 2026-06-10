export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="h-4 w-36 animate-pulse rounded bg-muted" />

      {/* Customer header */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-40 animate-pulse rounded-lg bg-muted" />
            <div className="h-4 w-56 animate-pulse rounded bg-muted" />
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="h-8 w-8 animate-pulse rounded bg-muted" />
            <div className="h-3 w-14 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="mt-4 flex gap-6 border-t pt-4">
          <div className="h-3 w-36 animate-pulse rounded bg-muted" />
          <div className="h-3 w-36 animate-pulse rounded bg-muted" />
        </div>
      </div>

      {/* History heading */}
      <div className="h-4 w-32 animate-pulse rounded bg-muted" />

      {/* Enquiry list */}
      <div className="divide-y rounded-xl border bg-card shadow-sm overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-4 w-16 animate-pulse rounded-full bg-muted" />
              </div>
              <div className="h-3 w-48 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-4 w-4 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
