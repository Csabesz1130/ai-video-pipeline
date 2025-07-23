import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "../../lib/utils"

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked)
    }

    return (
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          className={cn(
            "peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 bg-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-blue-600 checked:border-blue-600 appearance-none",
            className
          )}
          ref={ref}
          onChange={handleChange}
          {...props}
        />
        <Check className="absolute left-0 top-0 h-4 w-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }