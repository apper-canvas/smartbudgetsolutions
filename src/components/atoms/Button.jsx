import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Button = forwardRef(({ 
  children, 
  variant = "primary", 
  size = "default", 
  className, 
  disabled,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-green-600 hover:from-green-700 hover:to-primary text-white shadow-lg hover:shadow-xl focus:ring-primary/50",
    secondary: "bg-gradient-to-r from-secondary to-blue-600 hover:from-blue-700 hover:to-secondary text-white shadow-lg hover:shadow-xl focus:ring-secondary/50",
    outline: "border-2 border-primary text-primary bg-white hover:bg-primary hover:text-white shadow-md hover:shadow-lg focus:ring-primary/50",
    ghost: "text-text-secondary hover:bg-gray-100 hover:text-text-primary",
    danger: "bg-gradient-to-r from-error to-red-600 hover:from-red-700 hover:to-error text-white shadow-lg hover:shadow-xl focus:ring-error/50"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    default: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  return (
    <button
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;