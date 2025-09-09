import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import CategoryBadge from "@/components/molecules/CategoryBadge";
import SearchFilter from "@/components/molecules/SearchFilter";
import ApperIcon from "@/components/ApperIcon";
import { transactionService } from "@/services/api/transactionService";
import { formatCurrency, formatDate } from "@/utils/formatting";

const TransactionsList = ({ 
  transactions = [], 
  loading = false, 
  onEdit, 
  onRefresh,
  showFilters = true 
}) => {
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);
  const [deleting, setDeleting] = useState(null);

  const handleFilter = (filters) => {
    let filtered = transactions;

    if (filters.search) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        t.category.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    setFilteredTransactions(filtered);
  };

  const handleDelete = async (transaction) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    setDeleting(transaction.Id);
    try {
      await transactionService.delete(transaction.Id);
      toast.success("Transaction deleted successfully!");
      onRefresh();
    } catch (error) {
      toast.error("Failed to delete transaction");
    } finally {
      setDeleting(null);
    }
  };

  const categories = [...new Set(transactions.map(t => t.category))];

  // Update filtered transactions when transactions change
  useState(() => {
    setFilteredTransactions(transactions);
  }, [transactions]);

  if (loading) {
    return (
      <Card>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 mb-6">
            <ApperIcon name="Loader2" size={20} className="animate-spin text-primary" />
            <h3 className="text-lg font-semibold text-text-primary">Loading Transactions...</h3>
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-32" />
                    <div className="h-3 bg-gray-300 rounded w-24" />
                  </div>
                </div>
                <div className="h-4 bg-gray-300 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-r from-secondary/20 to-blue-200">
          <ApperIcon name="Receipt" size={20} className="text-secondary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Recent Transactions</h3>
          <p className="text-sm text-text-secondary">{transactions.length} total transactions</p>
        </div>
      </div>

      {showFilters && transactions.length > 0 && (
        <div className="mb-6">
          <SearchFilter onFilter={handleFilter} categories={categories} />
        </div>
      )}

      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <ApperIcon name="Receipt" size={48} className="mx-auto text-text-secondary mb-4" />
            <p className="text-text-secondary font-medium">No transactions found</p>
            <p className="text-sm text-text-secondary">Add your first transaction to get started</p>
          </div>
        ) : (
          filteredTransactions.map((transaction, index) => (
            <motion.div
              key={transaction.Id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              className="p-4 rounded-lg border border-gray-200 bg-gradient-to-r from-white to-gray-50/50 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`p-2 rounded-full ${
                    transaction.type === "income" 
                      ? "bg-gradient-to-r from-success/20 to-green-100" 
                      : "bg-gradient-to-r from-error/20 to-red-100"
                  }`}>
                    <ApperIcon 
                      name={transaction.type === "income" ? "TrendingUp" : "TrendingDown"} 
                      size={16} 
                      className={transaction.type === "income" ? "text-success" : "text-error"} 
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-1">
                      <h4 className="font-medium text-text-primary truncate">
                        {transaction.description}
                      </h4>
                      <CategoryBadge category={transaction.category} />
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-text-secondary">
                      <span>{formatDate(transaction.date)}</span>
                      <Badge variant={transaction.type === "income" ? "income" : "expense"}>
                        {transaction.type}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${
                      transaction.type === "income" ? "text-success" : "text-error"
                    }`}>
                      {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(transaction)}
                      className="p-2"
                    >
                      <ApperIcon name="Edit2" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(transaction)}
                      disabled={deleting === transaction.Id}
                      className="p-2 text-error hover:text-error hover:bg-error/10"
                    >
                      {deleting === transaction.Id ? (
                        <ApperIcon name="Loader2" size={16} className="animate-spin" />
                      ) : (
                        <ApperIcon name="Trash2" size={16} />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </Card>
  );
};

export default TransactionsList;