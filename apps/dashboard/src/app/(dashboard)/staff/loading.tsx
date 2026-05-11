export default function StaffLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-20 animate-pulse rounded bg-muted" />
          <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-9 w-28 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden divide-y">
        <div className="h-9 animate-pulse bg-muted/40" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-36 animate-pulse rounded bg-muted" />
              <div className="h-3 w-48 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-8 w-32 animate-pulse rounded bg-muted" />
            <div className="flex gap-1">
              <div className="h-8 w-8 animate-pulse rounded bg-muted" />
              <div className="h-8 w-8 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
