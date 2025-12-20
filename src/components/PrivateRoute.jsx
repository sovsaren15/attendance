import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  // A simple check for the authentication token in local storage.
  const isAuthenticated = !!localStorage.getItem('authToken');

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;