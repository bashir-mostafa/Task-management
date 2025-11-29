// src/routes/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ role, children }) {
  const { state } = useAuth();

  if (!state.access) return <Navigate to="/auth/login" replace />;

  if (role && role !== state.role) return <Navigate to="/" replace />; 

  return children;
}
