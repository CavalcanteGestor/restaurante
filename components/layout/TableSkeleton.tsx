export default function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-4">
      {/* Header Skeleton */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={`header-${i}`} className="h-4 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
      
      {/* Rows Skeleton */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="grid gap-4 py-4 border-b border-gray-100" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={`cell-${rowIndex}-${colIndex}`} className="h-4 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      ))}
    </div>
  )
}

