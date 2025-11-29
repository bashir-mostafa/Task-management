// src/pages/admin/projects/pages/ProjectCreatePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import ProjectForm from "../../components/ProjectForm";
import { projectService } from "../../services/projectService";
import useDarkMode from "../../../../../hooks/useDarkMode";
import Toast from "../../../../../components/Toast";
import { useState } from "react";

export default function ProjectCreatePage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isDark } = useDarkMode();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const isRTL = i18n.language === "ar";

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  const handleSaveProject = async (projectData) => {
    setIsSubmitting(true);
    try {
      const result = await projectService.createProject(projectData);
      showToast(t("projectCreatedSuccessfully"), "success");
      
      // الانتقال إلى صفحة المشروع الذي تم إنشاؤه
      setTimeout(() => {
        navigate(`/dashboard/projects/${result.id || result.data?.id}`);
      }, 1000);
    } catch (error) {
      console.error("Error creating project:", error);
      showToast(t("saveError"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    navigate(`/dashboard/projects`);
  };

  return (
    <div className="min-h-screen p-6 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className={`flex items-center gap-4 mb-6 ${isRTL ? "flex-row-reverse" : ""}`}>
        <button
          onClick={handleClose}
          className={`flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <ArrowLeft size={20} />
          <span>{t("backToProjects")}</span>
        </button>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("createNewProject")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t("createProjectDescription")}
          </p>
        </div>
      </div>

      {/* Project Form */}
      <div className="max-w-4xl mx-auto">
        <ProjectForm
          onSubmit={handleSaveProject}
          onClose={handleClose}
          isSubmitting={isSubmitting}
          isRTL={isRTL}
        />
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
}