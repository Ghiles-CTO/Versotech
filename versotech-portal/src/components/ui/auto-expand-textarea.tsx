'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export type AutoExpandTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const AutoExpandTextarea = React.forwardRef<HTMLTextAreaElement, AutoExpandTextareaProps>(
  ({ className, onChange, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)

    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
      }
    }, [])

    React.useEffect(() => {
      adjustHeight()
    }, [props.value, adjustHeight])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      adjustHeight()
      onChange?.(e)
    }

    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      },
      [ref]
    )

    return (
      <textarea
        ref={setRefs}
        className={cn(
          'flex min-h-[44px] max-h-[200px] w-full rounded-md border border-input',
          'bg-background px-3 py-2 text-sm ring-offset-background',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'resize-none overflow-y-auto',
          'transition-all duration-200 ease-out',
          className
        )}
        onChange={handleChange}
        {...props}
      />
    )
  }
)
AutoExpandTextarea.displayName = 'AutoExpandTextarea'

export { AutoExpandTextarea }
