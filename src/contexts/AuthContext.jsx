// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    user: null,
    access: null,
    refresh: null,
    role: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access");

    if (token) {
      try {
        // فك تشفير التوكن محليًا للتحقق من تاريخ الإنتهاء
        const payload = JSON.parse(atob(token.split(".")[1]));
        const exp = payload.exp;
        const currentTime = Math.floor(Date.now() / 1000);

        if (exp < currentTime) {
          // التوكن منتهي الصلاحية
          console.log("Token is expired");
          setState({ user: null, access: null, refresh: null, role: null });
          setLoading(false);
          return;
        }
      } catch (error) {
        // إذا فشل فك التشفير، اعتبره غير صالح
        localStorage.removeItem("access");
        setState({ user: null, access: null, refresh: null, role: null });
        setLoading(false);
        return;
      }

      // تعيين التوكن في الهيدر
      api.defaults.headers["Authorization"] = `Bearer ${token}`;

      // إضافة timeout للطلب
      api
        .get("/me/", { timeout: 2000 })
        .then((res) => {
          if (!res.data) {
            throw new Error("No data in response");
          }
          // استخدام optional chaining لتجنب الخطأ
          const userData = res.data;
          const userRole = userData?.role || null;

          setState({
            user: userData,
            access: token,
            refresh: null,
            role: userRole,
          });
        })
        .catch((error) => {
          localStorage.removeItem("access");
          setState({ user: null, access: null, refresh: null, role: null });
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = ({ user, access, refresh }) => {
    // optional chaining هنا أيضًا
    const userRole = user?.role || null;
    setState({ user, access, refresh, role: userRole });
    api.defaults.headers["Authorization"] = `Bearer ${access}`;
    localStorage.setItem("access", access);
  };

  const logout = () => {
    setState({ user: null, access: null, refresh: null, role: null });
    delete api.defaults.headers["Authorization"];
    localStorage.removeItem("access");
  };

  return (
    <AuthContext.Provider value={{ state, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
