"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        style: {
          color: 'white',
        },
        classNames: {
          toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-white group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-white/90',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          success: 'group-[.toast]:text-white',
          error: 'group-[.toast]:text-white',
          info: 'group-[.toast]:text-white',
          warning: 'group-[.toast]:text-white',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
