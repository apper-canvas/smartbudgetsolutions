import { useState } from "react";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const SearchFilter = ({ onFilter, categories = [] }) => {
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    type: ""
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { search: "", category: "", type: "" };
    setFilters(clearedFilters);
    onFilter(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm space-y-4">
      <div className="flex items-center gap-2 text-text-primary font-medium">
        <ApperIcon name="Filter" size={18} />
        Filters
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Input
            placeholder="Search transactions..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>
        
        <div>
          <Select
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Select>
        </div>
        
        <div>
          <Select
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </Select>
        </div>
        
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="w-full md:w-auto"
          >
            <ApperIcon name="X" size={16} className="mr-2" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;