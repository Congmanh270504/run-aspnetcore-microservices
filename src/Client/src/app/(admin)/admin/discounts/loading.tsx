export default function Loading() {
    return (
        <div className="space-y-6 animate-pulse p-2">
            {/* Header skeleton */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-slate-200" />
                    <div className="space-y-2">
                        <div className="h-7 w-56 rounded bg-slate-200" />
                        <div className="h-4 w-72 rounded bg-slate-200" />
                    </div>
                </div>
                <div className="h-10 w-40 rounded-md bg-slate-200" />
            </div>

            {/* Table skeleton */}
            <div className="rounded-xl border border-slate-200 bg-card shadow-sm p-4 space-y-3">
                <div className="h-10 w-full rounded bg-slate-200 mb-4" />
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-12 w-full rounded bg-slate-100" />
                ))}
            </div>
        </div>
    );
}
