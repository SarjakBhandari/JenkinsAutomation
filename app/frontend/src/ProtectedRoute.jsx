import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");

  if (!token) {
    return <Navigate to="/" replace />; // Redirect to login if no token
  }

  if (!allowedRoles.includes(userType)) {
    return <Navigate to="/" replace />; // Redirect if role is not allowed
  }

  return <Outlet />;
};

export default ProtectedRoute;
