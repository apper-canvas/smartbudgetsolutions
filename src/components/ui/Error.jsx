import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ 
  message = "Something went wrong", 
  onRetry,
  title = "Error"
}) => {
  return (
    <Card className="text-center py-12">
      <div className="space-y-6">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-error/20 to-red-100 rounded-full flex items-center justify-center mx-auto">
            <ApperIcon name="AlertCircle" size={32} className="text-error" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-error">{title}</h3>
          <p className="text-text-secondary max-w-md mx-auto">{message}</p>
        </div>

        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="mx-auto">
            <ApperIcon name="RefreshCw" size={16} className="mr-2" />
            Try Again
          </Button>
        )}
      </div>
    </Card>
  );
};

export default Error;