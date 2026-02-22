import * as React from "react"

import { cn } from "@/lib/utils"
import { clampDateInputYear } from "@/lib/forms/date-input"

function Input({ className, type, onInput, ...props }: React.ComponentProps<"input">) {
  const handleInput = React.useCallback(
    (event: React.FormEvent<HTMLInputElement>) => {
      if (type === 'date') {
        clampDateInputYear(event)
      }
      onInput?.(event)
    },
    [onInput, type]
  )

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-background border-input h-11 md:h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base text-foreground shadow-sm transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-blue-500 focus-visible:ring-blue-500/20 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      onInput={handleInput}
      {...props}
    />
  )
}

export { Input }
