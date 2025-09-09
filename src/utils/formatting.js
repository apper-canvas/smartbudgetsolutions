export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(Math.abs(amount) || 0);
};

export const formatDate = (date) => {
  try {
    return new Intl.DateFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    }).format(new Date(date));
  } catch (error) {
    console.error("Error formatting date:", error);
    return date?.toString() || "Invalid Date";
  }
};

export const formatDateShort = (date) => {
  try {
    return new Intl.DateFormat("en-US", {
      month: "short",
      day: "numeric"
    }).format(new Date(date));
  } catch (error) {
    console.error("Error formatting short date:", error);
    return date?.toString() || "Invalid Date";
  }
};

export const formatPercentage = (value) => {
  return `${Math.round(value)}%`;
};

export const getCurrentMonth = () => {
  return new Date().toISOString().slice(0, 7); // YYYY-MM format
};

export const getMonthName = (monthString) => {
  const date = new Date(monthString + "-01");
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

export const generateMonthOptions = (count = 12) => {
  const months = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = date.toISOString().slice(0, 7);
    const label = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    months.push({ value, label });
  }
  
  return months;
};