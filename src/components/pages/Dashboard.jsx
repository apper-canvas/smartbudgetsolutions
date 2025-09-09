import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import StatCard from "@/components/molecules/StatCard";
import TransactionModal from "@/components/organisms/TransactionModal";
import ExpensePieChart from "@/components/organisms/ExpensePieChart";
import SpendingTrendChart from "@/components/organisms/SpendingTrendChart";
import TransactionsList from "@/components/organisms/TransactionsList";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import { transactionService } from "@/services/api/transactionService";
import { budgetService } from "@/services/api/budgetService";
import { formatCurrency, getCurrentMonth, generateMonthOptions } from "@/utils/formatting";

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [transactionsData, budgetsData] = await Promise.all([
        transactionService.getAll(),
        budgetService.getAll()
      ]);
      
      setTransactions(transactionsData);
      setBudgets(budgetsData);
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionSuccess = () => {
    loadDashboardData();
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleCloseModal = () => {
    setShowTransactionModal(false);
    setEditingTransaction(null);
  };

// Calculate statistics for current month
  const currentMonthTransactions = transactions.filter(t => {
    if (!t.date_c) return false;
    const date = new Date(t.date_c);
    if (isNaN(date.getTime())) return false;
    const transactionMonth = date.toISOString().slice(0, 7);
    return transactionMonth === selectedMonth;
  });

  const currentMonthIncome = currentMonthTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthExpenses = currentMonthTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthBalance = currentMonthIncome - currentMonthExpenses;

  const totalBudget = budgets
    .filter(b => b.month === selectedMonth)
    .reduce((sum, b) => sum + b.limit, 0);

  const budgetUsed = (currentMonthExpenses / totalBudget) * 100;

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const monthOptions = generateMonthOptions();

  if (loading) {
    return <Loading message="Loading your financial dashboard..." />;
  }

  if (error) {
    return <Error message={error} onRetry={loadDashboardData} />;
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
            Financial Dashboard
          </h1>
          <p className="text-text-secondary">
            Track your income, expenses, and budget goals
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-48"
          >
            {monthOptions.map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </Select>
          <Button
            onClick={() => setShowTransactionModal(true)}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="Plus" size={16} />
            <span>Add Transaction</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <StatCard
            title="Monthly Balance"
            value={formatCurrency(currentMonthBalance)}
            icon="Wallet"
            changeType={currentMonthBalance >= 0 ? "positive" : "negative"}
            gradient
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <StatCard
            title="Monthly Income"
            value={formatCurrency(currentMonthIncome)}
            icon="TrendingUp"
            changeType="positive"
            gradient
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <StatCard
            title="Monthly Expenses"
            value={formatCurrency(currentMonthExpenses)}
            icon="TrendingDown"
            changeType="negative"
            gradient
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <StatCard
            title="Budget Used"
            value={totalBudget > 0 ? `${Math.round(budgetUsed)}%` : "No Budget"}
            icon="Target"
            changeType={budgetUsed > 80 ? "negative" : budgetUsed > 60 ? "neutral" : "positive"}
            gradient
          />
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <ExpensePieChart selectedMonth={selectedMonth} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <SpendingTrendChart selectedMonth={selectedMonth} />
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <TransactionsList
          transactions={recentTransactions}
          loading={false}
          onEdit={handleEditTransaction}
          onRefresh={loadDashboardData}
          showFilters={false}
        />
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

export default Dashboard;