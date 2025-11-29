import React from "react";
import { useTranslation } from "react-i18next";

export default function FormActions({ onClose, isSubmitting, isEditing, isRTL }) {
  const { t } = useTranslation();

  return (
    <div className={`flex gap-3 pt-4 ${isRTL ? "flex-row-reverse" : ""}`}>
      <button
        type="button"
        onClick={onClose}
        disabled={isSubmitting}
        className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
      >
        {t("cancel")}
      </button>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex-1 px-6 py-3 bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-accent))] text-white rounded-xl transition-all duration-200 font-semibold hover:scale-105 active:scale-95 shadow-lg shadow-[rgba(var(--color-primary-600),0.25)]"
      >
        {isSubmitting ? t("saving") + "..." : isEditing ? t("update") : t("create")}
      </button>
    </div>
  );
}
