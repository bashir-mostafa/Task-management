// src/pages/login/components/FormHeader.jsx
import React from "react";
import { Target } from "lucide-react";

export default function FormHeader({ t }) {
  return (
    <div className="text-center mb-10">
      <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
        <Target className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-primary dark:text-white mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        {t("appName")}
      </h1>
      <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
        {t("welcomeBack")}
      </p>
      <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
        {t("signInToContinue") || "Sign in to continue to your workspace"}
      </p>
    </div>
  );
}