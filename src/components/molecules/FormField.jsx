import { cn } from "@/utils/cn";

const FormField = ({ 
  label, 
  children, 
  error, 
  required = false,
  className 
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-error animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;