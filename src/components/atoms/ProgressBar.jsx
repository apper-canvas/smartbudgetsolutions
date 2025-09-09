import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const ProgressBar = forwardRef(({ 
  value = 0, 
  max = 100, 
  className,
  variant = "default",
  showLabel = false,
  ...props 
}, ref) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const variants = {
    default: "bg-primary",
    success: "bg-gradient-to-r from-success to-green-500",
    warning: "bg-gradient-to-r from-warning to-orange-500",
    error: "bg-gradient-to-r from-error to-red-500"
  };
  
  return (
    <div ref={ref} className={cn("space-y-1", className)} {...props}>
      {showLabel && (
        <div className="flex justify-between text-sm text-text-secondary">
          <span>{Math.round(percentage)}%</span>
          <span>{value.toLocaleString()} / {max.toLocaleString()}</span>
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            variants[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
});

ProgressBar.displayName = "ProgressBar";

export default ProgressBar;