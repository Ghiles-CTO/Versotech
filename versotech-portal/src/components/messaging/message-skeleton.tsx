import { cn } from '@/lib/utils'

interface MessageSkeletonProps {
  isSent?: boolean
  count?: number
}

function SingleMessageSkeleton({ isSent = false }: { isSent?: boolean }) {
  return (
    <div
      className={cn(
        'flex gap-3 animate-pulse',
        isSent ? 'justify-end' : 'justify-start'
      )}
    >
      {!isSent && (
        <div className="h-8 w-8 rounded-full bg-muted/60 shrink-0" />
      )}
      <div
        className={cn(
          'flex flex-col gap-2 max-w-[70%]',
          isSent ? 'items-end' : 'items-start'
        )}
      >
        {!isSent && <div className="h-3 w-24 bg-muted/60 rounded" />}
        <div
          className={cn(
            'rounded-2xl bg-muted/60',
            isSent ? 'rounded-br-md' : 'rounded-bl-md',
            'h-20 w-full min-w-[200px]'
          )}
        />
        <div className="h-2 w-16 bg-muted/40 rounded" />
      </div>
      {isSent && (
        <div className="h-8 w-8 rounded-full bg-muted/60 shrink-0" />
      )}
    </div>
  )
}

export function MessageSkeleton({ isSent, count = 3 }: MessageSkeletonProps) {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <SingleMessageSkeleton
          key={i}
          isSent={isSent !== undefined ? isSent : i % 2 === 0}
        />
      ))}
    </div>
  )
}
