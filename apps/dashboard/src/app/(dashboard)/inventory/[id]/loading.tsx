export default function VehicleDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="h-5 w-36 animate-pulse rounded bg-muted" />
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
          <div className="h-4 w-36 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-7 w-24 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-4 h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="aspect-video w-full animate-pulse rounded-xl bg-muted" />
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-4 h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
