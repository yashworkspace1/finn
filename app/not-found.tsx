export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="text-center">
        <div className="text-9xl font-bold text-violet-600/10 mb-4 select-none">404</div>
        <h2 className="text-2xl font-bold mb-2">Page not found</h2>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <a
            href="/dashboard"
            className="px-6 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors font-medium"
          >
            Go to Dashboard
          </a>
          <a
            href="/"
            className="px-6 py-3 bg-card border border-border rounded-xl hover:bg-muted transition-colors font-medium text-sm"
          >
            Home
          </a>
        </div>
      </div>
    </div>
  )
}
