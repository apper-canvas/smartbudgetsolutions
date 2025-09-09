import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Card from "@/components/atoms/Card";
import FormField from "@/components/molecules/FormField";
import GoalCard from "@/components/organisms/GoalCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { savingsGoalService } from "@/services/api/savingsGoalService";
import { formatCurrency } from "@/utils/formatting";

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    deadline: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await savingsGoalService.getAll();
      // Sort by deadline (soonest first)
      const sortedData = data.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
      setGoals(sortedData);
    } catch (err) {
      setError("Failed to load savings goals");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = "Goal name is required";
    }
    
    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      errors.targetAmount = "Target amount must be greater than 0";
    }
    
    if (!formData.currentAmount || parseFloat(formData.currentAmount) < 0) {
      errors.currentAmount = "Current amount cannot be negative";
    }

    if (parseFloat(formData.currentAmount) > parseFloat(formData.targetAmount)) {
      errors.currentAmount = "Current amount cannot exceed target amount";
    }
    
    if (!formData.deadline) {
      errors.deadline = "Deadline is required";
    } else {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (deadlineDate < today) {
        errors.deadline = "Deadline cannot be in the past";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const goalData = {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount)
      };

      if (editingGoal) {
        await savingsGoalService.update(editingGoal.Id, goalData);
        toast.success("Goal updated successfully!");
      } else {
        await savingsGoalService.create(goalData);
        toast.success("Goal created successfully!");
      }
      
      loadGoals();
      handleCloseForm();
    } catch (err) {
      toast.error(editingGoal ? "Failed to update goal" : "Failed to create goal");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: new Date(goal.deadline).toISOString().slice(0, 10)
    });
    setFormErrors({});
    setShowGoalForm(true);
  };

  const handleCloseForm = () => {
    setShowGoalForm(false);
    setEditingGoal(null);
    setFormData({
      name: "",
      targetAmount: "",
      currentAmount: "",
      deadline: ""
    });
    setFormErrors({});
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Calculate statistics
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount).length;
  const totalTargetAmount = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallProgress = totalTargetAmount > 0 ? (totalSaved / totalTargetAmount) * 100 : 0;

  // Get minimum date (today)
  const today = new Date().toISOString().slice(0, 10);

  if (loading) {
    return <Loading message="Loading your savings goals..." />;
  }

  if (error) {
    return <Error message={error} onRetry={loadGoals} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Savings Goals
          </h1>
          <p className="text-text-secondary">
            Set financial targets and track your progress
          </p>
        </div>
        
        <Button
          onClick={() => setShowGoalForm(true)}
          className="flex items-center space-x-2"
        >
          <ApperIcon name="Plus" size={16} />
          <span>Add Goal</span>
        </Button>
      </div>

      {/* Goals Overview */}
      {goals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-white via-gray-50/80 to-green-50/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-r from-success/20 to-green-200">
                <ApperIcon name="Trophy" size={20} className="text-success" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Goals Overview</h3>
                <p className="text-sm text-text-secondary">Your savings progress summary</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-sm font-medium text-text-secondary mb-1">Total Goals</p>
                <p className="text-2xl font-bold text-primary">{totalGoals}</p>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-text-secondary mb-1">Completed</p>
                <p className="text-2xl font-bold text-success">{completedGoals}</p>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-text-secondary mb-1">Total Saved</p>
                <p className="text-2xl font-bold text-success">{formatCurrency(totalSaved)}</p>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-text-secondary mb-1">Progress</p>
                <p className="text-2xl font-bold text-primary">{Math.round(overallProgress)}%</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Goal Form */}
      {showGoalForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-secondary/20 to-blue-200">
                  <ApperIcon name={editingGoal ? "Edit" : "Plus"} size={20} className="text-secondary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {editingGoal ? "Edit Savings Goal" : "Create New Savings Goal"}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseForm}
              >
                <ApperIcon name="X" size={16} />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Goal Name" required error={formErrors.name}>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., Emergency Fund, Vacation, New Car"
                    error={formErrors.name}
                  />
                </FormField>

                <FormField label="Target Amount" required error={formErrors.targetAmount}>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-text-secondary">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.targetAmount}
                      onChange={(e) => handleInputChange("targetAmount", e.target.value)}
                      className="pl-8"
                      placeholder="0.00"
                      error={formErrors.targetAmount}
                    />
                  </div>
                </FormField>

                <FormField label="Current Amount" required error={formErrors.currentAmount}>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-text-secondary">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.currentAmount}
                      onChange={(e) => handleInputChange("currentAmount", e.target.value)}
                      className="pl-8"
                      placeholder="0.00"
                      error={formErrors.currentAmount}
                    />
                  </div>
                </FormField>

                <FormField label="Target Date" required error={formErrors.deadline}>
                  <Input
                    type="date"
                    min={today}
                    value={formData.deadline}
                    onChange={(e) => handleInputChange("deadline", e.target.value)}
                    error={formErrors.deadline}
                  />
                </FormField>
              </div>

              {formData.targetAmount && formData.currentAmount && (
                <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Progress Preview:</span>
                    <span className="font-semibold text-primary">
                      {Math.round((parseFloat(formData.currentAmount) / parseFloat(formData.targetAmount)) * 100)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (parseFloat(formData.currentAmount) / parseFloat(formData.targetAmount)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseForm}
                  className="flex-1"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={submitting}
                >
                  {submitting ? (
                    <ApperIcon name="Loader2" size={16} className="animate-spin mr-2" />
                  ) : (
                    <ApperIcon name={editingGoal ? "Save" : "Plus"} size={16} className="mr-2" />
                  )}
                  {editingGoal ? "Update Goal" : "Create Goal"}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Goals Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {goals.length === 0 ? (
          <Empty
            title="No savings goals yet"
            description="Create your first savings goal to start building your financial future"
            actionLabel="Create Goal"
            onAction={() => setShowGoalForm(true)}
            icon="Trophy"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal, index) => (
              <motion.div
                key={goal.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
              >
                <GoalCard
                  goal={goal}
                  onEdit={handleEdit}
                  onRefresh={loadGoals}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Goals;