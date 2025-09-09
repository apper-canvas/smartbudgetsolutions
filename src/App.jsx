import { Routes, Route } from "react-router-dom";
import Layout from "@/components/organisms/Layout";
import Dashboard from "@/components/pages/Dashboard";
import Transactions from "@/components/pages/Transactions";
import Budget from "@/components/pages/Budget";
import Goals from "@/components/pages/Goals";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-gray-50 to-blue-50/30">
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/goals" element={<Goals />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;