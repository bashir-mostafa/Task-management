// src/routes/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ requiredRole, children }) {
  const { state } = useAuth();

  // إذا لم يكن مسجل الدخول
  if (!state.access) return <Navigate to="/auth/login" replace />;

  // إذا كان هناك دور مطلوب
  if (requiredRole) {
    // تحويل الأرقام إلى نص للتوافق
    let userRole = state.role;
    
    // إذا كان الرول رقم، نحوله إلى نص
    if (userRole === 1 || userRole === "1") {
      userRole = "Admin";
    } else if (userRole === 2 || userRole === "2") {
      userRole = "User";
    }
    
    // إذا كان المطلوب "Admin" والمستخدم ليس أدمن
    if (requiredRole === "Admin" && userRole !== "Admin") {
      return <Navigate to="/home" replace />;
    }
    
    // إذا كان المطلوب "User" والمستخدم ليس مستخدم عادي
    if (requiredRole === "User" && userRole !== "User") {
      return <Navigate to="/auth/login" replace />;
    }
  }

  return children;
}