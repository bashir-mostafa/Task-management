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
import Select from "../../../../../components/UI/Select";
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
    start_date: "",
    end_date: "",
    status: 1,
    evaluation_admin: 0,
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

    if (!formData.start_date) {
      errors.start_date = t("startDateRequired");
    }

    if (!formData.end_date) {
      errors.end_date = t("endDateRequired");
    }

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
      const taskData = {
        ...formData,
        project_id: parseInt(projectId),
        evaluation_admin: parseInt(formData.evaluation_admin),
      };

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

            <DateFields
              startDate={formData.start_date}
              endDate={formData.end_date}
              onStartDateChange={(e) => handleChange("start_date", e.target.value)}
              onEndDateChange={(e) => handleChange("end_date", e.target.value)}
              startDateError={formErrors.start_date}
              endDateError={formErrors.end_date}
              t={t}
              isRTL={isRTL}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label={t("status")}
                name="status"
                value={formData.status}
                onChange={(e) => handleChange("status", parseInt(e.target.value))}
              >
                <option value={0}>{t("notImplemented")}</option>
                <option value={1}>{t("underImplementation")}</option>
                <option value={2}>{t("completed")}</option>
              </Select>

              <Input
                type="number"
                label={`${t("evaluation")} (0-10)`}
                name="evaluation_admin"
                value={formData.evaluation_admin}
                onChange={(e) => handleChange("evaluation_admin", e.target.value)}
                min="0"
                max="10"
                step="0.5"
                placeholder="0-10"
              />
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