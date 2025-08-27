import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  return (
    <Loader2 
      className={cn("animate-spin", sizeClasses[size], className)} 
    />
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  className?: string
}

export function LoadingOverlay({ isLoading, children, className }: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  )
}