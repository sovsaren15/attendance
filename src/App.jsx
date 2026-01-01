import React, { Suspense } from "react";
import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import Layout from "./components/Layout.jsx";

const PrivateRoute = React.lazy(() => import("./components/PrivateRoute.jsx"));
const AttendanceScanner = React.lazy(() => import("./pages/AttendanceScanner.jsx"));
const AttendanceRecord = React.lazy(() => import("./pages/AttendanceRecord.jsx"));
const EmployeeRegistration = React.lazy(() => import("./pages/EmployeeRegistration.jsx"));
const EmployeeList = React.lazy(() => import("./pages/EmployeeList.jsx"));
const Dashboard = React.lazy(() => import("./pages/Dashboard.jsx"));
const TopPerformers = React.lazy(() => import("./pages/TopPerformers.jsx"));
const AttendancePage = React.lazy(() => import("./pages/AttendancePage.jsx"));
const Login = React.lazy(() => import("./pages/Login.jsx"));
const Settings = React.lazy(() => import("./pages/Settings.jsx"));
const Home = React.lazy(() => import("./pages/Home.jsx"));

const AdminGuard = () => {
  const token = localStorage.getItem("authToken");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  if (!token) {
    return <Navigate to="/" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }
  return <Outlet />;
};

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/AttendanceScanner" element={<AttendanceScanner />} />
        <Route path="/records" element={<AttendanceRecord />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />

        {/* Private Routes */}
        <Route element={<AdminGuard />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/register" element={<EmployeeRegistration />} />
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/top" element={<TopPerformers />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Catch-all route for 404 Not Found */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;