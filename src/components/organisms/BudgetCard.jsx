import { useState } from "react";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ProgressBar from "@/components/atoms/ProgressBar";
import CategoryBadge from "@/components/molecules/CategoryBadge";
import ApperIcon from "@/components/ApperIcon";
import { budgetService } from "@/services/api/budgetService";
import { formatCurrency, formatPercentage } from "@/utils/formatting";

const BudgetCard = ({ budget, onEdit, onRefresh }) => {
  const [deleting, setDeleting] = useState(false);

  const percentage = (budget.spent / budget.limit) * 100;
  const remaining = budget.limit - budget.spent;
  const isOverBudget = budget.spent > budget.limit;

  const getProgressVariant = () => {
    if (isOverBudget) return "error";
    if (percentage >= 80) return "warning";
    return "success";
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete the budget for ${budget.category}?`)) {
      return;
    }

    setDeleting(true);
    try {
      await budgetService.delete(budget.Id);
      toast.success("Budget deleted successfully!");
      onRefresh();
    } catch (error) {
      toast.error("Failed to delete budget");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card hover className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/80 to-blue-50/30 pointer-events-none" />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary/20 to-primary/30">
              <ApperIcon name="Target" size={18} className="text-primary" />
            </div>
            <div>
              <CategoryBadge category={budget.category} />
              <p className="text-xs text-text-secondary mt-1">Monthly Budget</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(budget)}
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
              <p className="text-sm text-text-secondary">Spent</p>
              <p className="text-xl font-bold text-error">
                {formatCurrency(budget.spent)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-secondary">Budget</p>
              <p className="text-xl font-bold text-text-primary">
                {formatCurrency(budget.limit)}
              </p>
            </div>
          </div>

          <ProgressBar
            value={budget.spent}
            max={budget.limit}
            variant={getProgressVariant()}
            showLabel={false}
          />

          <div className="flex justify-between items-center text-sm">
            <div className={`font-medium ${isOverBudget ? 'text-error' : 'text-success'}`}>
              {isOverBudget ? 'Over by' : 'Remaining'}: {formatCurrency(Math.abs(remaining))}
            </div>
            <div className={`font-semibold ${
              isOverBudget ? 'text-error' : 
              percentage >= 80 ? 'text-warning' : 'text-success'
            }`}>
              {formatPercentage(percentage)}
            </div>
          </div>

          {isOverBudget && (
            <div className="p-3 rounded-lg bg-gradient-to-r from-error/10 to-red-50 border border-error/20">
              <div className="flex items-center space-x-2">
                <ApperIcon name="AlertTriangle" size={16} className="text-error" />
                <p className="text-sm text-error font-medium">Budget exceeded!</p>
              </div>
            </div>
          )}

          {!isOverBudget && percentage >= 80 && (
            <div className="p-3 rounded-lg bg-gradient-to-r from-warning/10 to-orange-50 border border-warning/20">
              <div className="flex items-center space-x-2">
                <ApperIcon name="AlertCircle" size={16} className="text-warning" />
                <p className="text-sm text-warning font-medium">Approaching budget limit</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default BudgetCard;