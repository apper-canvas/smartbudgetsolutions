import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No data available",
  description = "Get started by adding your first item",
  actionLabel = "Get Started",
  onAction,
  icon = "Plus"
}) => {
  return (
    <Card className="text-center py-12">
      <div className="space-y-6">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center mx-auto">
            <ApperIcon name={icon} size={32} className="text-primary" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
          <p className="text-text-secondary max-w-md mx-auto">{description}</p>
        </div>

        {onAction && (
          <Button onClick={onAction} className="mx-auto">
            <ApperIcon name="Plus" size={16} className="mr-2" />
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default Empty;