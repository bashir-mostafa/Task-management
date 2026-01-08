// src/AppRoutes.jsx
import React, { Suspense } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "../components/Layout/Layout";
import { useAuth } from "../contexts/AuthContext";
import { Lazy } from "./LazyLoader";

export default function AppRoutes() {
  const { state, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
      <Routes>
        {/* المسار الرئيسي - إعادة التوجيه */}
        <Route
          path="/"
          element={
            <Navigate
              to={
                state.access
                  ? (state.role === 1 || state.role === "1" || state.role === "Admin")
                    ? "/dashboard"
                    : "/home"
                  : "/auth/login"
              }
              replace
            />
          }
        />

        {/* مسارات المصادقة - فقط للغير مسجلين */}
        <Route
          path="/auth"
          element={!state.access ? <Outlet /> : <Navigate to="/" replace />}>
          <Route path="login" element={<Lazy.LoginPage />} />
          <Route path="register" element={<Lazy.RegisterPage />} />
        </Route>

        {/* مسارات محمية بشرط تسجيل الدخول */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
          
          {/* مسارات المستخدم العادي - فقط للمستخدمين غير الإدمن */}
          <Route
            path="/home/*"
            element={
              <ProtectedRoute requiredRole="user">
                <Lazy.HomeRouter />
              </ProtectedRoute>
            }
          />

          {/* مسارات الإدمن - فقط للمستخدمين الإدمن */}
          <Route
            path="/*"
            element={
              <ProtectedRoute requiredRole="Admin">
                <Lazy.AdminRouter />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* صفحة غير مصرح بالوصول */}
        <Route path="/unauthorized" element={<Lazy.Unauthorized />} />

        {/* صفحة 404 */}
        <Route path="*" element={<Lazy.NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}