import React from "react";
import { useTranslation } from "react-i18next";

export default function LoadingSpinner({ fullScreen = false, size = "medium" }) {
  const { t } = useTranslation();
  
  const sizeClasses = {
    small: "h-8 w-8",
    medium: "h-12 w-12",
    large: "h-16 w-16"
  };
  
  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className={`animate-spin rounded-full border-b-2 border-primary mx-auto ${sizeClasses[size]}`}
            role="status"
            aria-label={t("loading")}
          />
          <span className="sr-only">{t("loading")}</span>
        </div>
      </div>
    );
  }
  
  return (
    <div
      className={`animate-spin rounded-full border-b-2 border-primary ${sizeClasses[size]}`}
      role="status"
      aria-label={t("loading")}
    >
      <span className="sr-only">{t("loading")}</span>
    </div>
  );
}