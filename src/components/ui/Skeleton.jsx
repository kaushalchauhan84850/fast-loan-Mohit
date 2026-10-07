/** Shimmering placeholder block for loading states. */
export default function Skeleton({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-xl bg-gradient-to-r from-navy-100 via-navy-50 to-navy-100 ${className}`}
    />
  );
}

/** Composed skeleton for a dashboard-style card. */
export function CardSkeleton({ lines = 3, className = '' }) {
  return (
    <div className={`rounded-2xl border border-navy-100 bg-white p-6 shadow-soft ${className}`}>
      <Skeleton className="h-5 w-1/3" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className={`h-4 ${i % 2 ? 'w-5/6' : 'w-2/3'}`} />
        ))}
      </div>
    </div>
  );
}

/** Table-shaped skeleton for schedules / history. */
export function TableSkeleton({ rows = 5, className = '' }) {
  return (
    <div className={`rounded-2xl border border-navy-100 bg-white p-6 shadow-soft ${className}`}>
      <Skeleton className="h-5 w-40" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}
