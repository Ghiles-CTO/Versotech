"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        style: {
          background: '#18181b',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        classNames: {
          toast: 'group toast group-[.toaster]:bg-zinc-900 group-[.toaster]:text-white group-[.toaster]:border-white/20 group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-gray-300',
          actionButton: 'group-[.toast]:bg-sky-500 group-[.toast]:text-white group-[.toast]:hover:bg-sky-600',
          cancelButton: 'group-[.toast]:bg-zinc-800 group-[.toast]:text-gray-300 group-[.toast]:hover:bg-zinc-700',
          success: 'group-[.toast]:text-green-400',
          error: 'group-[.toast]:text-red-400',
          info: 'group-[.toast]:text-blue-400',
          warning: 'group-[.toast]:text-yellow-400',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
