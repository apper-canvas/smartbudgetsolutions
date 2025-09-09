import { cn } from "@/utils/cn";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";

const CategoryBadge = ({ category, className }) => {
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      "Food & Dining": "UtensilsCrossed",
      "Transportation": "Car",
      "Shopping": "ShoppingBag",
      "Entertainment": "Film",
      "Bills & Utilities": "Receipt",
      "Healthcare": "Heart",
      "Education": "GraduationCap",
      "Travel": "Plane",
      "Groceries": "ShoppingCart",
      "Insurance": "Shield",
      "Investments": "TrendingUp",
      "Salary": "DollarSign",
      "Freelance": "Briefcase",
      "Business": "Building2",
      "Gifts": "Gift",
      "Other Income": "Plus",
      "Other Expense": "Minus"
    };
    return iconMap[categoryName] || "Tag";
  };

  const getCategoryColor = (categoryName) => {
    const colorMap = {
      "Food & Dining": "bg-orange-100 text-orange-700 border-orange-200",
      "Transportation": "bg-blue-100 text-blue-700 border-blue-200",
      "Shopping": "bg-purple-100 text-purple-700 border-purple-200",
      "Entertainment": "bg-pink-100 text-pink-700 border-pink-200",
      "Bills & Utilities": "bg-gray-100 text-gray-700 border-gray-200",
      "Healthcare": "bg-red-100 text-red-700 border-red-200",
      "Education": "bg-indigo-100 text-indigo-700 border-indigo-200",
      "Travel": "bg-teal-100 text-teal-700 border-teal-200",
      "Groceries": "bg-green-100 text-green-700 border-green-200",
      "Insurance": "bg-blue-100 text-blue-700 border-blue-200",
      "Investments": "bg-emerald-100 text-emerald-700 border-emerald-200",
      "Salary": "bg-green-100 text-green-700 border-green-200",
      "Freelance": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "Business": "bg-slate-100 text-slate-700 border-slate-200",
      "Gifts": "bg-rose-100 text-rose-700 border-rose-200",
      "Other Income": "bg-cyan-100 text-cyan-700 border-cyan-200",
      "Other Expense": "bg-gray-100 text-gray-700 border-gray-200"
    };
    return colorMap[categoryName] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <Badge 
      className={cn(
        "inline-flex items-center gap-1.5 border",
        getCategoryColor(category),
        className
      )}
    >
      <ApperIcon name={getCategoryIcon(category)} size={12} />
      {category}
    </Badge>
  );
};

export default CategoryBadge;