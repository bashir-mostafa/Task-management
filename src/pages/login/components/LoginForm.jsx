// src/pages/login/components/LoginForm.jsx
import React from "react";
import { User, Target } from "lucide-react"; // Added User import; Target was already here but unused in this file (it's in FormHeader)
import { useTranslation } from "react-i18next";
import PasswordField from "../../../components/UI/PasswordField";
import InputField from "../../../components/UI/InputField";
import Button from "../../../components/UI/Button";
import ErrorMessage from "./ErrorMessage";
import FormHeader from "./FormHeader";

export default function LoginForm({
  username,
  setUsername,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  error,
  loading,
  handleSubmit,
  isRTL,
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <FormHeader t={t} />

      {error && <ErrorMessage error={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          label={t("username")}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={t("enterUsername")}
          Icon={User}
          error={error && error.includes("username") ? error : ""}
          type="text"
          isRTL={isRTL}
        />

        <PasswordField
          label={t("password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          placeholder={t("enterPassword")}
          error={error && error.includes("password") ? error : ""}
          isRTL={isRTL}
        />

      

        <Button type="submit" disabled={loading} size="lg" fullWidth className="mt-2">
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="animate-pulse">{t("loading")}</span>
            </div>
          ) : (
            <span className="relative z-10 font-semibold text-lg">{t("login")}</span>
          )}
        </Button>
        
      
      </form>
    </div>
  );
}