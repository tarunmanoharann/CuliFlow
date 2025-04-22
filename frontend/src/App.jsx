import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./Pages/Dashboard";
import DemandForecast from "./Pages/DemandForecast";
import Inventory from "./Pages/Inventory";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Reports from "./Pages/Reports";
import ScoreCard from "./Pages/ScoreCard";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/demanda" element={<DemandForecast />} />
        <Route path="/score" element={<ScoreCard />} />
        

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
