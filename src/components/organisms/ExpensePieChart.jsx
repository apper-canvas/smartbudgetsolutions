import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { transactionService } from "@/services/api/transactionService";
import { formatCurrency } from "@/utils/formatting";

const ExpensePieChart = ({ selectedMonth }) => {
  const [chartData, setChartData] = useState({
    series: [],
    labels: [],
    colors: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadExpenseData();
  }, [selectedMonth]);

  const loadExpenseData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const transactions = await transactionService.getAll();
      
      // Filter expenses for selected month
      const expenses = transactions.filter(t => {
        const transactionMonth = new Date(t.date).toISOString().slice(0, 7);
        return t.type === "expense" && transactionMonth === selectedMonth;
      });

      if (expenses.length === 0) {
        setChartData({ series: [], labels: [], colors: [] });
        setLoading(false);
        return;
      }

      // Group expenses by category
      const categoryTotals = expenses.reduce((acc, transaction) => {
        const category = transaction.category;
        acc[category] = (acc[category] || 0) + transaction.amount;
        return acc;
      }, {});

      // Convert to chart format
      const series = Object.values(categoryTotals);
      const labels = Object.keys(categoryTotals);
      
      // Generate colors for categories
      const colors = [
        "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8",
        "#F7DC6F", "#BB8FCE", "#85C1E9", "#F8C471", "#82E0AA",
        "#F1948A", "#85D1C0", "#AED6F1", "#F9E79F", "#D7BDE2"
      ];

      setChartData({
        series,
        labels,
        colors: colors.slice(0, labels.length)
      });
    } catch (err) {
      setError("Failed to load expense data");
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    chart: {
      type: "pie",
      height: 350,
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800
      }
    },
    colors: chartData.colors,
    labels: chartData.labels,
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "14px",
      fontFamily: "Inter, sans-serif",
      markers: {
        width: 12,
        height: 12,
        radius: 6
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Expenses",
              fontSize: "14px",
              color: "#6B7280",
              formatter: function (w) {
                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return formatCurrency(total);
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val, opts) {
        const value = opts.w.globals.series[opts.seriesIndex];
        return formatCurrency(value);
      },
      style: {
        fontSize: "12px",
        fontWeight: "600",
        colors: ["#ffffff"]
      }
    },
    tooltip: {
      y: {
        formatter: function(value) {
          return formatCurrency(value);
        }
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
          <p className="text-text-secondary">Loading expense breakdown...</p>
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

  if (chartData.series.length === 0) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <div className="text-center space-y-4">
          <ApperIcon name="PieChart" size={32} className="text-text-secondary mx-auto" />
          <div>
            <p className="text-text-secondary font-medium">No expense data</p>
            <p className="text-text-secondary text-sm">Add some expenses to see the breakdown</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-r from-accent/20 to-orange-200">
          <ApperIcon name="PieChart" size={20} className="text-accent" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Expense Breakdown</h3>
          <p className="text-sm text-text-secondary">Spending by category</p>
        </div>
      </div>
      
      <div className="h-80">
        <Chart
          options={chartOptions}
          series={chartData.series}
          type="donut"
          height="100%"
        />
      </div>
    </Card>
  );
};

export default ExpensePieChart;