import { useState } from "react";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ProgressBar from "@/components/atoms/ProgressBar";
import ApperIcon from "@/components/ApperIcon";
import { savingsGoalService } from "@/services/api/savingsGoalService";
import { formatCurrency, formatDate } from "@/utils/formatting";

const GoalCard = ({ goal, onEdit, onRefresh }) => {
  const [deleting, setDeleting] = useState(false);

  const percentage = (goal.currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.currentAmount;
  const isCompleted = goal.currentAmount >= goal.targetAmount;

  const daysUntilDeadline = () => {
    const today = new Date();
    const deadline = new Date(goal.deadline);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const days = daysUntilDeadline();

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete the goal "${goal.name}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      await savingsGoalService.delete(goal.Id);
      toast.success("Goal deleted successfully!");
      onRefresh();
    } catch (error) {
      toast.error("Failed to delete goal");
    } finally {
      setDeleting(false);
    }
  };

  const getProgressVariant = () => {
    if (isCompleted) return "success";
    if (days < 30 && percentage < 80) return "warning";
    return "default";
  };

  const getStatusIcon = () => {
    if (isCompleted) return "CheckCircle";
    if (days < 0) return "AlertTriangle";
    return "Target";
  };

  const getStatusColor = () => {
    if (isCompleted) return "text-success";
    if (days < 0) return "text-error";
    if (days < 30 && percentage < 80) return "text-warning";
    return "text-primary";
  };

  return (
    <Card hover className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/80 to-green-50/30 pointer-events-none" />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${
              isCompleted 
                ? "from-success/20 to-green-100"
                : "from-primary/20 to-primary/30"
            }`}>
              <ApperIcon 
                name={getStatusIcon()} 
                size={18} 
                className={isCompleted ? "text-success" : "text-primary"} 
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-text-primary truncate">{goal.name}</h3>
              <p className="text-xs text-text-secondary">
                Target: {formatDate(goal.deadline)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(goal)}
              className="p-1.5"
            >
              <ApperIcon name="Edit2" size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 text-error hover:text-error hover:bg-error/10"
            >
              {deleting ? (
                <ApperIcon name="Loader2" size={14} className="animate-spin" />
              ) : (
                <ApperIcon name="Trash2" size={14} />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-text-secondary">Saved</p>
              <p className="text-xl font-bold text-success">
                {formatCurrency(goal.currentAmount)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-secondary">Goal</p>
              <p className="text-xl font-bold text-text-primary">
                {formatCurrency(goal.targetAmount)}
              </p>
            </div>
          </div>

          <ProgressBar
            value={goal.currentAmount}
            max={goal.targetAmount}
            variant={getProgressVariant()}
            showLabel={false}
          />

          <div className="flex justify-between items-center text-sm">
            <div className="font-medium text-text-primary">
              {isCompleted ? 'Goal achieved!' : `${formatCurrency(remaining)} to go`}
            </div>
            <div className="font-semibold text-success">
              {Math.min(100, Math.round(percentage))}%
            </div>
          </div>

          <div className={`flex items-center space-x-2 text-sm ${getStatusColor()}`}>
            <ApperIcon name="Calendar" size={14} />
            <span className="font-medium">
              {isCompleted 
                ? "Goal completed!"
                : days < 0 
                ? `${Math.abs(days)} days overdue`
                : days === 0
                ? "Due today"
                : `${days} days left`
              }
            </span>
          </div>

          {isCompleted && (
            <div className="p-3 rounded-lg bg-gradient-to-r from-success/10 to-green-50 border border-success/20">
              <div className="flex items-center space-x-2">
                <ApperIcon name="CheckCircle" size={16} className="text-success" />
                <p className="text-sm text-success font-medium">Congratulations! Goal achieved!</p>
              </div>
            </div>
          )}

          {!isCompleted && days < 0 && (
            <div className="p-3 rounded-lg bg-gradient-to-r from-error/10 to-red-50 border border-error/20">
              <div className="flex items-center space-x-2">
                <ApperIcon name="AlertTriangle" size={16} className="text-error" />
                <p className="text-sm text-error font-medium">Deadline passed</p>
              </div>
            </div>
          )}

          {!isCompleted && days > 0 && days < 30 && percentage < 80 && (
            <div className="p-3 rounded-lg bg-gradient-to-r from-warning/10 to-orange-50 border border-warning/20">
              <div className="flex items-center space-x-2">
                <ApperIcon name="AlertCircle" size={16} className="text-warning" />
                <p className="text-sm text-warning font-medium">Deadline approaching</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default GoalCard;