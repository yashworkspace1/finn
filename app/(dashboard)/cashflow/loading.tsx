export default function CashFlowLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-muted rounded w-48" />
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-xl" />)}
      </div>
      <div className="h-72 bg-muted rounded-xl" />
      <div className="h-40 bg-muted rounded-xl" />
    </div>
  )
}
