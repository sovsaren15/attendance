import React, { Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
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
        <Route element={<PrivateRoute />}>
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