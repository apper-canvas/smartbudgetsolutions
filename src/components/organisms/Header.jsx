import { useState, useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { AuthContext } from "../../App";
const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { logout } = useContext(AuthContext);
  const { user } = useSelector((state) => state.user);

  const navigation = [
    { name: "Dashboard", path: "/", icon: "LayoutDashboard" },
    { name: "Transactions", path: "/transactions", icon: "Receipt" },
    { name: "Budget", path: "/budget", icon: "Target" },
    { name: "Goals", path: "/goals", icon: "Trophy" }
  ];

  const getPageTitle = () => {
    const current = navigation.find(item => item.path === location.pathname);
    return current ? current.name : "Dashboard";
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-gradient-to-r from-white via-gray-50/80 to-blue-50/30 border-b border-gray-200 shadow-sm backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-lg">
              <ApperIcon name="Wallet" className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                SmartBudget
              </h1>
              <p className="text-xs text-text-secondary hidden sm:block">Personal Finance Tracker</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg"
                      : "text-text-secondary hover:text-primary hover:bg-primary/10"
                  )
                }
              >
                <ApperIcon name={item.icon} size={18} />
                <span>{item.name}</span>
              </NavLink>
            ))}
            
            {/* User Menu and Logout */}
            <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200">
              {user && (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.firstName?.[0] || user.emailAddress?.[0] || 'U'}
                    </span>
                  </div>
                  <span className="text-sm text-text-secondary hidden lg:block">
                    {user.firstName || user.emailAddress}
                  </span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-1"
              >
                <ApperIcon name="LogOut" size={16} />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {user && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.firstName?.[0] || user.emailAddress?.[0] || 'U'}
                </span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              <ApperIcon name={mobileMenuOpen ? "X" : "Menu"} size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-3 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg"
                        : "text-text-secondary hover:text-primary hover:bg-primary/10"
                    )
                  }
                >
                  <ApperIcon name={item.icon} size={18} />
                  <span>{item.name}</span>
                </NavLink>
              ))}
              
              {/* Mobile Logout Button */}
              <div className="pt-2 mt-2 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <ApperIcon name="LogOut" size={16} />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;