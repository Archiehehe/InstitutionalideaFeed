export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-pulse flex flex-col items-center gap-2">
        <div className="h-2 w-24 bg-muted rounded-full" />
        <div className="text-xs text-muted-foreground">Loading...</div>
      </div>
    </div>
  )
}
