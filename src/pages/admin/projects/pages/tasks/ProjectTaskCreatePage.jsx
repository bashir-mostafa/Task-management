import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Save } from "lucide-react";
import { taskService } from "../../services/taskService";
import { projectService } from "../../services/projectService";
import PageHeader from "../../../../../components/common/PageHeader";
import FormContainer from "../../../../../components/common/FormContainer";
import FormActions from "../../../../../components/common/FormActions";
import DateFields from "../../../../../components/common/DateFields";
import Input from "../../../../../components/UI/InputField";
import TextArea from "../../../../../components/UI/TextAreaField";
import Toast from "../../../../../components/Toast";
import LoadingSpinner from "../../../../../components/UI/LoadingSpinner";

export default function ProjectTaskCreatePage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isRTL] = useState(i18n.language === "ar");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [project, setProject] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: null,
    end_date: null,
    notes_admin: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const result = await projectService.getProjectById(projectId);
        if (result.project) {
          setProject(result.project);
          
          // تعيين التاريخ الافتراضي من المشروع
          if (result.project.start_date) {
            setFormData(prev => ({
              ...prev,
              start_date: result.project.start_date.split('T')[0] || ""
            }));
          }
        } else {
          showToast(t("projectNotFound"), "error");
        }
      } catch (error) {
        console.error("Error fetching project details:", error);
        showToast(error.response?.data?.message || t("fetchError"), "error");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId, t]);

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = t("taskNameRequired");
    }

    if (!formData.description.trim()) {
      errors.description = t("taskDescriptionRequired");
    }

    // التحقق من صحة التواريخ إذا كانت موجودة
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);

      if (endDate < startDate) {
        errors.end_date = t("endDateAfterStartDate");
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast(t("pleaseFixErrors"), "error");
      return;
    }

    setSubmitting(true);

    try {
      // تحضير البيانات لإرسالها
      const taskData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        project_id: parseInt(projectId),
        notes_admin: formData.notes_admin?.trim() || null, // إذا كانت فارغة ترسل null
        // لا نرسل الحالة - سيعتمد النظام على الافتراضي
      };

      // إضافة التواريخ فقط إذا كانت موجودة وغير فارغة
      if (formData.start_date && formData.start_date.trim()) {
        taskData.start_date = formData.start_date;
      } else {
        taskData.start_date = null; // إرسال null إذا كان فارغاً
      }

      if (formData.end_date && formData.end_date.trim()) {
        taskData.end_date = formData.end_date;
      } else {
        taskData.end_date = null; // إرسال null إذا كان فارغاً
      }

      console.log("Sending task data:", taskData);

      await taskService.createTask(taskData);

      showToast(t("taskCreatedSuccessfully"), "success");
      
      setTimeout(() => {
        navigate(`/projects/${projectId}/tasks`);
      }, 1500);
    } catch (error) {
      console.error("Error creating task:", error);
      showToast(error.response?.data?.message || t("createError"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleDateChange = (field, value) => {
    // السماح بحذف التاريخ (إرسال string فارغ)
    const dateValue = value || "";
    handleChange(field, dateValue);
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!project) {
    return (
      <div className="min-h-screen p-6 bg-background">
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4" aria-hidden="true">
            ❌
          </div>
          <h2 className="text-2xl font-bold text-text mb-4">
            {t("projectNotFound")}
          </h2>
          <button
            onClick={() => navigate("/projects")}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors"
          >
            {t("backToProjects")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-background text-text">
      <PageHeader
        title={t("addNewTask")}
        subtitle={`${t("forProject")}: ${project.name}`}
        backButtonText={t("backToTasks")}
        backButtonPath={() => navigate(`/projects/${projectId}/tasks`)}
        isRTL={isRTL}
      />

      <FormContainer maxWidth="3xl">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <Input
              label={`${t("taskName")} *`}
              name="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              error={formErrors.name}
              required
              placeholder={t("enterTaskName")}
              isRTL={isRTL}
            />

            <TextArea
              label={`${t("description")} *`}
              name="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              error={formErrors.description}
              rows={4}
              required
              placeholder={t("enterTaskDescription")}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {t("dates")} ({t("optional")})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    {t("startDate")}
                  </label>
                  <input
                    type="date"
                    value={formData.start_date || ""}
                    onChange={(e) => handleDateChange("start_date", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  {formErrors.start_date && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.start_date}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t("startDateOptional")}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    {t("endDate")}
                  </label>
                  <input
                    type="date"
                    value={formData.end_date || ""}
                    onChange={(e) => handleDateChange("end_date", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  {formErrors.end_date && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.end_date}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t("endDateOptional")}
                  </p>
                </div>
              </div>
            </div>

            <TextArea
              label={t("adminNotes")}
              name="notes_admin"
              value={formData.notes_admin}
              onChange={(e) => handleChange("notes_admin", e.target.value)}
              rows={3}
              placeholder={t("enterAdminNotes")}
            />

           

            <FormActions
              isRTL={isRTL}
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/projects/${projectId}/tasks`)}
              submitText={t("createTask")}
              cancelText={t("cancel")}
              submitting={submitting}
              submitIcon={<Save size={20} />}
            />
          </div>
        </form>
      </FormContainer>

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