export default function OrdersLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-36 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-9 w-28 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden divide-y">
        <div className="h-9 animate-pulse bg-muted/40" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-4 gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
              </div>
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
            </div>
            <div className="space-y-1 text-right">
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
