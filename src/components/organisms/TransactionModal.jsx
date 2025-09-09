import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";
import { transactionService } from "@/services/api/transactionService";
import { categoryService } from "@/services/api/categoryService";
import { formatCurrency } from "@/utils/formatting";

const TransactionModal = ({ isOpen, onClose, transaction = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    amount: "",
    type: "expense",
    category: "",
    description: "",
    date: new Date().toISOString().slice(0, 10)
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: Math.abs(transaction.amount).toString(),
        type: transaction.type,
        category: transaction.category,
        description: transaction.description,
        date: new Date(transaction.date).toISOString().slice(0, 10)
      });
    } else {
      setFormData({
        amount: "",
        type: "expense",
        category: "",
        description: "",
        date: new Date().toISOString().slice(0, 10)
      });
    }
    setErrors({});
  }, [transaction, isOpen]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      toast.error("Failed to load categories");
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }
    
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    
    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (transaction) {
        await transactionService.update(transaction.Id, transactionData);
        toast.success("Transaction updated successfully!");
      } else {
        await transactionService.create(transactionData);
        toast.success("Transaction added successfully!");
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(transaction ? "Failed to update transaction" : "Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    
    // Reset category when type changes
    if (field === "type" && formData.category) {
      setFormData(prev => ({ ...prev, category: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-gradient-to-br from-white to-gray-50/80 rounded-xl shadow-2xl w-full max-w-md p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-primary/20 to-primary/30">
                <ApperIcon name={transaction ? "Edit" : "Plus"} size={20} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">
                {transaction ? "Edit Transaction" : "Add Transaction"}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1"
            >
              <ApperIcon name="X" size={20} />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Amount" required error={errors.amount}>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-text-secondary">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => handleInputChange("amount", e.target.value)}
                    className="pl-8"
                    placeholder="0.00"
                    error={errors.amount}
                  />
                </div>
              </FormField>

              <FormField label="Type" required>
                <Select
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </Select>
              </FormField>
            </div>

            <FormField label="Category" required error={errors.category}>
              <Select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                error={errors.category}
              >
                <option value="">Select a category</option>
                {filteredCategories.map(category => (
                  <option key={category.Id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Description" required error={errors.description}>
              <Input
                type="text"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter transaction description"
                error={errors.description}
              />
            </FormField>

            <FormField label="Date" required error={errors.date}>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                error={errors.date}
              />
            </FormField>

            {formData.amount && (
              <div className="p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Preview:</span>
                  <span className={`font-semibold ${formData.type === 'income' ? 'text-success' : 'text-error'}`}>
                    {formData.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(formData.amount) || 0)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading}
              >
                {loading ? (
                  <ApperIcon name="Loader2" size={16} className="animate-spin mr-2" />
                ) : (
                  <ApperIcon name={transaction ? "Save" : "Plus"} size={16} className="mr-2" />
                )}
                {transaction ? "Update" : "Add"} Transaction
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TransactionModal;