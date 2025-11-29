// src/pages/admin/projects/pages/ProjectEditPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import ProjectForm from "../../components/ProjectForm";
import { projectService } from "../../services/projectService";
import useDarkMode from "../../../../../hooks/useDarkMode";
import Toast from "../../../../../components/Toast";

export default function ProjectEditPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isDark } = useDarkMode();
  const [project, setProject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const isRTL = i18n.language === "ar";

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const result = await projectService.getProjectById(projectId);
        console.log("📥 Fetched project for editing:", result);

        // تحقق من هيكل البيانات
        if (result && result.project) {
          setProject(result.project);
        } else if (result) {
          setProject(result);
        } else {
          throw new Error("Project data not found");
        }
      } catch (error) {
        console.error("❌ Error fetching project:", error);
        showToast(t("fetchError"), "error");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId, t]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  const handleSaveProject = async (projectData) => {
    setIsSubmitting(true);
    try {
      console.log("💾 Saving project data:", projectData);

      // تحويل البيانات إلى التنسيق المطلوب من API
      const apiData = {
        name: projectData.name,
        description: projectData.description,
        project_manager_id: projectData.project_Manager_id,
        status: projectData.status,
        start_date: projectData.start_date,
        end_date: projectData.end_date,
        notes: projectData.notes || "",
      };

      console.log("📤 API data to send:", apiData);

      await projectService.updateProject(projectId, apiData);
      showToast(t("projectUpdatedSuccessfully"), "success");

      setTimeout(() => {
        navigate(`/dashboard/projects/${projectId}`);
      }, 1000);
    } catch (error) {
      console.error("❌ Error updating project:", error);
      const errorMessage = error.response?.data?.message || t("saveError");
      showToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    navigate(`/dashboard/projects/${projectId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen p-6 bg-background">
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-text mb-4">
            {t("projectNotFound")}
          </h2>
          <button
            onClick={() => navigate("/dashboard/projects")}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors">
            {t("backToProjects")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-background text-text">
      {/* Header */}
      <div
        className={`flex items-center gap-4 mb-6 ${
          isRTL ? "flex-row-reverse" : ""
        }`}>
        <button
          onClick={handleClose}
          className={`flex items-center gap-2 px-4 py-2 bg-secondary text-text rounded-lg hover:bg-secondary/80 transition-colors ${
            isRTL ? "flex-row-reverse" : ""
          }`}>
          <ArrowLeft size={20} />
          <span>{t("backToProject")}</span>
        </button>

        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t("editProject")}: {project.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t("editProjectDescription")}
          </p>
        </div>
      </div>

      {/* Project Form */}
      <div className="max-w-4xl mx-auto">
        <ProjectForm
          project={project}
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
          duration={5000}
        />
      )}
    </div>
  );
}
