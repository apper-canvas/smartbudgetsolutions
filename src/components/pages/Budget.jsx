import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { budgetService } from "@/services/api/budgetService";
import { categoryService } from "@/services/api/categoryService";
import { transactionService } from "@/services/api/transactionService";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import FormField from "@/components/molecules/FormField";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import BudgetCard from "@/components/organisms/BudgetCard";
import { formatCurrency, generateMonthOptions, getCurrentMonth, getMonthName } from "@/utils/formatting";
const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [formData, setFormData] = useState({
    category: "",
    limit: "",
    month: getCurrentMonth()
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    updateBudgetSpending();
  }, [budgets]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
const [budgetsData, categoriesData] = await Promise.all([
        budgetService.getAll(),
        categoryService.getAll()
      ]);
      setBudgets(budgetsData);
      setCategories(categoriesData.filter(c => c.type_c === "expense"));
    } catch (err) {
      setError("Failed to load budget data");
    } finally {
      setLoading(false);
    }
  };

  const updateBudgetSpending = async () => {
    try {
const transactions = await transactionService.getAll();
      
      const updatedBudgets = budgets.map(budget => {
        const monthTransactions = transactions.filter(t => {
          // Check if date_c exists and is valid before parsing
          if (!t.date_c) {
            console.warn('Transaction missing date_c field:', t);
            return false;
          }
          
          try {
            const transactionDate = new Date(t.date_c);
            // Check if date is valid
            if (isNaN(transactionDate.getTime())) {
              console.warn('Invalid date_c value:', t.date_c, 'in transaction:', t);
              return false;
            }
            
            const transactionMonth = transactionDate.toISOString().slice(0, 7);
            return t.type_c === "expense" && 
                   t.category_c === budget.category_c && 
                   transactionMonth === budget.month_c;
          } catch (error) {
            console.warn('Date parsing error for transaction:', t, error);
            return false;
          }
        });
        
        const spent = monthTransactions.reduce((sum, t) => sum + (t.amount_c || 0), 0);
        return { ...budget, spent };
      });
      
      setBudgets(updatedBudgets);
    } catch (err) {
      console.error("Failed to update spending:", err);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.category) {
      errors.category = "Category is required";
    }
    
    if (!formData.limit || parseFloat(formData.limit) <= 0) {
      errors.limit = "Budget limit must be greater than 0";
    }
    
    if (!formData.month) {
      errors.month = "Month is required";
    }

// Check for duplicate category in same month
    const existingBudget = budgets.find(b => 
      b.category_c === formData.category && 
      b.month_c === formData.month &&
      (!editingBudget || b.Id !== editingBudget.Id)
    );
    
    if (existingBudget) {
      errors.category = "Budget already exists for this category in the selected month";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    try {
const budgetData = {
        category_c: formData.category,
        limit_c: parseFloat(formData.limit),
        month_c: formData.month,
        spent_c: 0
      };

      if (editingBudget) {
        await budgetService.update(editingBudget.Id, budgetData);
        toast.success("Budget updated successfully!");
      } else {
        await budgetService.create(budgetData);
        toast.success("Budget created successfully!");
      }
      
      loadData();
      handleCloseForm();
    } catch (err) {
      toast.error(editingBudget ? "Failed to update budget" : "Failed to create budget");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (budget) => {
setEditingBudget(budget);
    setFormData({
      category: budget.category_c,
      limit: budget.limit_c.toString(),
      month: budget.month_c
    });
    setFormErrors({});
    setShowBudgetForm(true);
  };

  const handleCloseForm = () => {
    setShowBudgetForm(false);
    setEditingBudget(null);
    setFormData({
      category: "",
      limit: "",
      month: getCurrentMonth()
    });
    setFormErrors({});
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

const currentMonthBudgets = budgets.filter(b => b.month_c === selectedMonth);
  const totalBudget = currentMonthBudgets.reduce((sum, b) => sum + (b.limit_c || 0), 0);
  const totalSpent = currentMonthBudgets.reduce((sum, b) => sum + (b.spent || 0), 0);
  const budgetUsage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const generateMonthOptions = () => {
    const months = [];
    const now = new Date();
    
    for (let i = -3; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const value = date.toISOString().slice(0, 7);
      const label = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      months.push({ value, label });
    }
    
    return months;
  };

  if (loading) {
    return <Loading message="Loading your budgets..." />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
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
            Budget Management
          </h1>
          <p className="text-text-secondary">
            Set spending limits and track your progress
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-48"
          >
            {generateMonthOptions().map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </Select>
          <Button
            onClick={() => setShowBudgetForm(true)}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="Plus" size={16} />
            <span>Add Budget</span>
          </Button>
        </div>
      </div>

      {/* Budget Overview */}
      {currentMonthBudgets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-white via-gray-50/80 to-blue-50/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-r from-primary/20 to-primary/30">
                <ApperIcon name="PieChart" size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {getMonthName(selectedMonth)} Overview
                </h3>
                <p className="text-sm text-text-secondary">Budget performance summary</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm font-medium text-text-secondary mb-1">Total Budget</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalBudget)}</p>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-text-secondary mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-error">{formatCurrency(totalSpent)}</p>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-text-secondary mb-1">Budget Usage</p>
                <p className={`text-2xl font-bold ${
                  budgetUsage > 100 ? 'text-error' :
                  budgetUsage > 80 ? 'text-warning' : 'text-success'
                }`}>
                  {Math.round(budgetUsage)}%
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Budget Form */}
      {showBudgetForm && (
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
                  <ApperIcon name={editingBudget ? "Edit" : "Plus"} size={20} className="text-secondary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {editingBudget ? "Edit Budget" : "Create New Budget"}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Category" required error={formErrors.category}>
                  <Select
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    error={formErrors.category}
                  >
<option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.Id} value={category.name_c || category.Name}>
                        {category.name_c || category.Name}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField label="Budget Limit" required error={formErrors.limit}>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-text-secondary">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.limit}
                      onChange={(e) => handleInputChange("limit", e.target.value)}
                      className="pl-8"
                      placeholder="0.00"
                      error={formErrors.limit}
                    />
                  </div>
                </FormField>

                <FormField label="Month" required error={formErrors.month}>
                  <Select
                    value={formData.month}
                    onChange={(e) => handleInputChange("month", e.target.value)}
                    error={formErrors.month}
                  >
                    {generateMonthOptions().map(month => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </div>

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
                    <ApperIcon name={editingBudget ? "Save" : "Plus"} size={16} className="mr-2" />
                  )}
                  {editingBudget ? "Update Budget" : "Create Budget"}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Budget Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {currentMonthBudgets.length === 0 ? (
          <Empty
            title={`No budgets for ${getMonthName(selectedMonth)}`}
            description="Create your first budget to start tracking your spending limits"
            actionLabel="Create Budget"
            onAction={() => setShowBudgetForm(true)}
            icon="Target"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentMonthBudgets.map((budget, index) => (
              <motion.div
                key={budget.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
              >
                <BudgetCard
                  budget={budget}
                  onEdit={handleEdit}
                  onRefresh={loadData}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Budget;