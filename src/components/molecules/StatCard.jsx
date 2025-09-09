import { cn } from "@/utils/cn";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const StatCard = ({ 
  title, 
  value, 
  icon, 
  change, 
  changeType = "neutral",
  className,
  gradient = false
}) => {
  const changeColors = {
    positive: "text-success",
    negative: "text-error",
    neutral: "text-text-secondary"
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden",
        gradient && "bg-gradient-to-br from-white via-gray-50/80 to-blue-50/60",
        className
      )}
      hover
    >
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 pointer-events-none" />
      )}
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-r from-primary/10 to-primary/20">
            <ApperIcon name={icon} className="h-5 w-5 text-primary" />
          </div>
          {change && (
            <div className={cn("text-sm font-medium", changeColors[changeType])}>
              {change > 0 ? "+" : ""}{change}%
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-text-secondary mb-1">{title}</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-text-primary to-text-primary/80 bg-clip-text text-transparent">
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default StatCard;