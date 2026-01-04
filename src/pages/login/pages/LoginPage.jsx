// src/pages/login/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../contexts/AuthContext";
import SettingsPanel from "../components/SettingsPanel";
import LoginForm from "../components/LoginForm";
import { loginUser } from "../services/authService"; 

export default function LoginPage() {
  const { login } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError(t("fillFields"));
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser(username, password);

      const { access, user, refresh } = data;

      if (!access) {
        throw new Error("No access token received from server");
      }

      login({ user, access, refresh });
      navigate("/home", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
    
      let errorMessage;
    
      if (err.response) {
        const serverMessage = err.response.data?.message || err.response.data;
    
        if (serverMessage.includes("username") && serverMessage.includes("not found")) {
          errorMessage = t("errors.usernameNotFound");
        } else if (serverMessage.includes("password")) {
          errorMessage = t("errors.invalidPassword");
        } else {
          errorMessage = serverMessage;
        }
    
      } else if (err.request) {
        errorMessage = t("errors.networkError");
      } else {
        errorMessage = t("errors.unknownError");
      }
    
      setError(errorMessage);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const isRTL = i18n.language === "ar";

 return (
    <div className={`min-h-screen w-full flex flex-col md:flex-row bg-gradient-to-br from-primary/15 via-secondary/5 to-accent/10 relative overflow-hidden ${
      isRTL ? "rtl" : "ltr"
    }`}>
      {/* لوحة الإعدادات */}
      <SettingsPanel position={isRTL ? "top-left" : "top-right"} />
      
     
      
      {/* نموذج تسجيل الدخول */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 z-10">
        <div className={`w-full max-w-md p-6 sm:p-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl dark:shadow-2xl border border-gray-100 dark:border-gray-800 transition-all duration-300 ${
          shake ? "animate-shake" : "hover:shadow-2xl dark:hover:shadow-3xl"
        }`}>
          
          <LoginForm
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            error={error}
            loading={loading}
            handleSubmit={handleSubmit}
            isRTL={isRTL}
          />
        </div>
      </div>
    </div>
  );
}