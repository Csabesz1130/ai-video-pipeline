import React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "../../lib/utils"

interface LoadingProps {
  size?: "sm" | "md" | "lg"
  className?: string
  message?: string
}

export function Loading({ size = "md", className, message }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex flex-col items-center space-y-2">
        <Loader2 
          className={cn("animate-spin text-blue-600", sizeClasses[size])}
          aria-hidden="true"
        />
        {message && (
          <p className="text-sm text-gray-600 animate-pulse">{message}</p>
        )}
      </div>
    </div>
  )
}

export function LoadingOverlay({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl">
        <Loading size="lg" message={message} />
      </div>
    </div>
  )
}

export function LoadingInline({ message }: { message?: string }) {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      {message && <span>{message}</span>}
    </div>
  )
}