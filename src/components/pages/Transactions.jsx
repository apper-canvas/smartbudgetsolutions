import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Button from "@/components/atoms/Button";
import TransactionModal from "@/components/organisms/TransactionModal";
import TransactionsList from "@/components/organisms/TransactionsList";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { transactionService } from "@/services/api/transactionService";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await transactionService.getAll();
      // Sort by date (newest first)
      const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(sortedData);
    } catch (err) {
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionSuccess = () => {
    loadTransactions();
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleCloseModal = () => {
    setShowTransactionModal(false);
    setEditingTransaction(null);
  };

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setShowTransactionModal(true);
  };

  if (loading) {
    return <Loading message="Loading your transactions..." />;
  }

  if (error) {
    return <Error message={error} onRetry={loadTransactions} />;
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
            Transactions
          </h1>
          <p className="text-text-secondary">
            Manage your income and expenses
          </p>
        </div>
        
        <Button
          onClick={handleAddTransaction}
          className="flex items-center space-x-2"
        >
          <ApperIcon name="Plus" size={16} />
          <span>Add Transaction</span>
        </Button>
      </div>

      {/* Quick Stats */}
      {transactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-gradient-to-r from-white to-gray-50/80 rounded-lg border border-gray-200 p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <ApperIcon name="Receipt" size={20} className="text-primary mr-2" />
                <span className="text-sm font-medium text-text-secondary">Total Transactions</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">{transactions.length}</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <ApperIcon name="TrendingUp" size={20} className="text-success mr-2" />
                <span className="text-sm font-medium text-text-secondary">Total Income</span>
              </div>
              <p className="text-2xl font-bold text-success">
                ${transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <ApperIcon name="TrendingDown" size={20} className="text-error mr-2" />
                <span className="text-sm font-medium text-text-secondary">Total Expenses</span>
              </div>
              <p className="text-2xl font-bold text-error">
                ${transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Transactions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {transactions.length === 0 ? (
          <Empty
            title="No transactions yet"
            description="Start tracking your finances by adding your first transaction"
            actionLabel="Add Transaction"
            onAction={handleAddTransaction}
            icon="Receipt"
          />
        ) : (
          <TransactionsList
            transactions={transactions}
            loading={false}
            onEdit={handleEditTransaction}
            onRefresh={loadTransactions}
            showFilters={true}
          />
        )}
      </motion.div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showTransactionModal}
        onClose={handleCloseModal}
        transaction={editingTransaction}
        onSuccess={handleTransactionSuccess}
      />
    </motion.div>
  );
};

export default Transactions;