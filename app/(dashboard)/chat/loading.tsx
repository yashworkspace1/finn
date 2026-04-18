export default function ChatLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] animate-pulse">
      <div className="h-16 bg-muted border-b" />
      <div className="flex-1 p-4 space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'justify-end' : ''}`}>
            {i % 2 !== 0 && <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0" />}
            <div className="h-12 bg-muted rounded-2xl w-48" />
          </div>
        ))}
      </div>
      <div className="h-20 bg-muted border-t" />
    </div>
  )
}
