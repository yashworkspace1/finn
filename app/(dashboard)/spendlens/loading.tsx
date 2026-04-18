export default function SpendLensLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-muted rounded w-40" />
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-muted rounded-xl" />
        <div className="h-80 bg-muted rounded-xl" />
      </div>
      <div className="h-48 bg-muted rounded-xl" />
      <div className="h-48 bg-muted rounded-xl" />
    </div>
  )
}
