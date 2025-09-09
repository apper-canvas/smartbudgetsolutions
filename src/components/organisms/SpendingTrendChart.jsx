import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { transactionService } from "@/services/api/transactionService";
import { budgetService } from "@/services/api/budgetService";
import { formatCurrency } from "@/utils/formatting";

const SpendingTrendChart = ({ selectedMonth }) => {
  const [chartData, setChartData] = useState({
    series: [],
    categories: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTrendData();
  }, [selectedMonth]);

  const loadTrendData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [transactions, budgets] = await Promise.all([
        transactionService.getAll(),
        budgetService.getAll()
      ]);
      
      // Get the selected month and previous 5 months
      const months = [];
      const currentDate = new Date(selectedMonth + "-01");
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        months.push(date.toISOString().slice(0, 7));
      }

      const spendingData = [];
      const budgetData = [];
      const categories = [];

      months.forEach(month => {
        // Calculate spending for this month
        const monthExpenses = transactions
          .filter(t => {
            const transactionMonth = new Date(t.date).toISOString().slice(0, 7);
            return t.type === "expense" && transactionMonth === month;
          })
          .reduce((sum, t) => sum + t.amount, 0);

        spendingData.push(monthExpenses);

        // Calculate budget for this month
        const monthBudget = budgets
          .filter(b => b.month === month)
          .reduce((sum, b) => sum + b.limit, 0);

        budgetData.push(monthBudget);

        // Format month for display
        const date = new Date(month + "-01");
        categories.push(date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }));
      });

      setChartData({
        series: [
          {
            name: "Spending",
            data: spendingData,
            color: "#F44336"
          },
          {
            name: "Budget",
            data: budgetData,
            color: "#2E7D32"
          }
        ],
        categories
      });
    } catch (err) {
      setError("Failed to load spending trend data");
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    chart: {
      type: "line",
      height: 350,
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800
      },
      toolbar: {
        show: false
      }
    },
    colors: ["#F44336", "#2E7D32"],
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: "smooth",
      width: 3
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          fontSize: "12px",
          fontFamily: "Inter, sans-serif",
          colors: "#6B7280"
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          fontFamily: "Inter, sans-serif",
          colors: "#6B7280"
        },
        formatter: function(value) {
          return formatCurrency(value);
        }
      }
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "14px",
      fontFamily: "Inter, sans-serif",
      markers: {
        width: 12,
        height: 12,
        radius: 6
      }
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    tooltip: {
      y: {
        formatter: function(value) {
          return formatCurrency(value);
        }
      }
    },
    markers: {
      size: 6,
      strokeWidth: 2,
      strokeColors: "#ffffff",
      hover: {
        size: 8
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          height: 300
        },
        legend: {
          fontSize: "12px"
        }
      }
    }]
  };

  if (loading) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <div className="text-center space-y-4">
          <ApperIcon name="Loader2" size={32} className="animate-spin text-primary mx-auto" />
          <p className="text-text-secondary">Loading spending trends...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <div className="text-center space-y-4">
          <ApperIcon name="AlertCircle" size={32} className="text-error mx-auto" />
          <div>
            <p className="text-error font-medium">Failed to load chart</p>
            <p className="text-text-secondary text-sm">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-r from-info/20 to-blue-200">
          <ApperIcon name="TrendingUp" size={20} className="text-info" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Spending Trends</h3>
          <p className="text-sm text-text-secondary">6-month comparison with budget</p>
        </div>
      </div>
      
      <div className="h-80">
        <Chart
          options={chartOptions}
          series={chartData.series}
          type="line"
          height="100%"
        />
      </div>
    </Card>
  );
};

export default SpendingTrendChart;