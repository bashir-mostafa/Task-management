// src/components/Projects/ProjectModal.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, FolderOpen } from "lucide-react";
import ProjectForm from "./ProjectForm";
import useDarkMode from "../../../../../hooks/useDarkMode";

export default function ProjectModal({ open, onClose, onSave, project }) {
  const { t, i18n } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { colorTheme } = useDarkMode();

  const isRTL = i18n.language === "ar";
  const isEditing = !!project;

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
        dir={isRTL ? "rtl" : "ltr"}>
        {/* الهيدر */}
        <div
          className={`flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-xl ${
            isRTL ? "flex-row-reverse" : ""
          }`}>
          <div
            className={`flex items-center gap-2 ${
              isRTL ? "flex-row-reverse" : ""
            }`}>
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
              <FolderOpen
                size={16}
                className="text-blue-600 dark:text-blue-400"
              />
            </div>
            <div className={isRTL ? "text-right" : "text-left"}>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {isEditing ? t("editProject") : t("addProject")}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X size={16} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* الفورم */}
        <ProjectForm
          project={project}
          onSubmit={handleSubmit}
          onClose={onClose}
          isSubmitting={isSubmitting}
          isRTL={isRTL}
          colorTheme={colorTheme}
        />
      </div>
    </div>
  );
}
