"use client"

import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
        info: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />,
        warning: <TriangleAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />,
        error: <OctagonX className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />,
        loading: <LoaderCircle className="h-5 w-5 animate-spin text-slate-500 shrink-0" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg font-sans text-sm rounded-xl p-4",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "group-[.toaster]:!bg-emerald-50/95 group-[.toaster]:!text-emerald-950 group-[.toaster]:!border-emerald-200 dark:group-[.toaster]:!bg-emerald-950/90 dark:group-[.toaster]:!text-emerald-100 dark:group-[.toaster]:!border-emerald-800",
          error:
            "group-[.toaster]:!bg-red-50/95 group-[.toaster]:!text-red-950 group-[.toaster]:!border-red-200 dark:group-[.toaster]:!bg-red-950/90 dark:group-[.toaster]:!text-red-100 dark:group-[.toaster]:!border-red-800",
          warning:
            "group-[.toaster]:!bg-amber-50/95 group-[.toaster]:!text-amber-950 group-[.toaster]:!border-amber-200 dark:group-[.toaster]:!bg-amber-950/90 dark:group-[.toaster]:!text-amber-100 dark:group-[.toaster]:!border-amber-800",
          info:
            "group-[.toaster]:!bg-blue-50/95 group-[.toaster]:!text-blue-950 group-[.toaster]:!border-blue-200 dark:group-[.toaster]:!bg-blue-950/90 dark:group-[.toaster]:!text-blue-100 dark:group-[.toaster]:!border-blue-800",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

