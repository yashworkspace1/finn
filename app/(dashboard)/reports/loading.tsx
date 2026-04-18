export default function ReportsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="h-9 bg-muted rounded-lg w-28" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-24 bg-muted rounded-xl" />)}
      </div>
      <div className="h-56 bg-muted rounded-xl" />
      <div className="h-64 bg-muted rounded-xl" />
    </div>
  )
}
