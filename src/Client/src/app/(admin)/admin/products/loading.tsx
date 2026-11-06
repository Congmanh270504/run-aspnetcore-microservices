export default function Loading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header bar skeleton */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-muted" />
                    <div className="space-y-2">
                        <div className="h-7 w-48 rounded bg-muted" />
                        <div className="h-4 w-72 rounded bg-muted" />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-9 w-36 rounded bg-muted" />
                    <div className="h-9 w-32 rounded bg-muted" />
                </div>
            </div>

            {/* StatCards skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-24 rounded-xl bg-muted border" />
                ))}
            </div>

            {/* Table skeleton */}
            <div className="rounded-xl border bg-card p-4 space-y-3">
                <div className="h-10 w-64 rounded bg-muted mb-4" />
                {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="h-12 rounded bg-muted" />
                ))}
            </div>
        </div>
    );
}
