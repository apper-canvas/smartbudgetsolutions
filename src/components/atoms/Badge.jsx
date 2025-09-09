import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Badge = forwardRef(({ 
  className, 
  variant = "default", 
  children, 
  ...props 
}, ref) => {
  const variants = {
    default: "bg-gray-100 text-text-secondary",
    success: "bg-gradient-to-r from-success/20 to-green-100 text-success border border-success/20",
    error: "bg-gradient-to-r from-error/20 to-red-100 text-error border border-error/20",
    warning: "bg-gradient-to-r from-warning/20 to-orange-100 text-warning border border-warning/20",
    info: "bg-gradient-to-r from-info/20 to-blue-100 text-info border border-info/20",
    income: "bg-gradient-to-r from-success/20 to-green-100 text-success border border-success/20",
    expense: "bg-gradient-to-r from-error/20 to-red-100 text-error border border-error/20"
  };
  
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-200",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = "Badge";

export default Badge;