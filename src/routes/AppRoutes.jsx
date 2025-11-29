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
        <Route
          path="/"
          element={
            <Navigate
              to={
                state.access
                  ? state.role === "Admin"
                    ? "/dashboard"
                    : "/home"
                  : "/auth/login"
              }
              replace
            />
          }
        />

        <Route
          path="/auth"
          element={!state.access ? <Outlet /> : <Navigate to="/" replace />}>
          <Route path="login" element={<Lazy.LoginPage />} />
        </Route>

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
          <Route
            path="/home/*"
            element={
              <ProtectedRoute requiredRole="user">
                <Lazy.HomeRouter />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute requiredRole="Admin">
                <Lazy.AdminRouter />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="/unauthorized" element={<Lazy.Unauthorized />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
