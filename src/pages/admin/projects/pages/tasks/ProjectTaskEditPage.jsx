import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Save } from "lucide-react";
import { taskService } from "../../services/taskService";
import PageHeader from "../../../../../components/common/PageHeader";
import FormContainer from "../../../../../components/common/FormContainer";
import FormActions from "../../../../../components/common/FormActions";
import DateFields from "../../../../../components/common/DateFields";
import Input from "../../../../../components/UI/InputField";
import TextArea from "../../../../../components/UI/TextAreaField";
import Select from "../../../../../components/UI/Select";
import Toast from "../../../../../components/Toast";
import LoadingSpinner from "../../../../../components/UI/LoadingSpinner";

export default function ProjectTaskEditPage() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  const [task, setTask] = useState({
    name: "",
    description: "",
    status: 1,
    start_date: "",
    end_date: "",
    evaluation_admin: 0,
    notes_admin: ""
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [isRTL] = useState(i18n.language === "ar");

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
    fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTaskById(taskId);
      
      if (response) {
        setTask({
          name: response.name || "",
          description: response.description || "",
          status: taskService.getStatusNumber(response.status) || 1,
          start_date: response.start_date?.split('T')[0] || "",
          end_date: response.end_date?.split('T')[0] || "",
          evaluation_admin: response.evaluation_admin || 0,
          notes_admin: response.notes_admin || ""
        });
      } else {
        setError(t("taskNotFound"));
        showToast(t("taskNotFound"), "error");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("fetchError");
      setError(errorMessage);
      showToast(errorMessage, "error");
      console.error("Error fetching task:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = useCallback(() => {
    const errors = {};

    if (!task.name.trim()) {
      errors.name = t("taskNameRequired");
    }

    if (!task.description.trim()) {
      errors.description = t("taskDescriptionRequired");
    }

    if (!task.start_date) {
      errors.start_date = t("startDateRequired");
    }

    if (!task.end_date) {
      errors.end_date = t("endDateRequired");
    }

    if (task.start_date && task.end_date) {
      const startDate = new Date(task.start_date);
      const endDate = new Date(task.end_date);

      if (endDate < startDate) {
        errors.end_date = t("endDateAfterStartDate");
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [task, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast(t("pleaseFixErrors"), "error");
      return;
    }
    
    setSaving(true);
    setError("");
    
    try {
      const taskData = {
        ...task,
        project_id: parseInt(projectId),
        evaluation_admin: parseInt(task.evaluation_admin),
      };

      await taskService.updateTask(taskId, taskData);

      showToast(t("taskUpdatedSuccessfully"), "success");
      
      setTimeout(() => {
        navigate(`/projects/${projectId}/tasks/${taskId}`);
      }, 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("updateError");
      setError(errorMessage);
      showToast(errorMessage, "error");
      console.error("Error updating task:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setTask(prev => ({ ...prev, [field]: value }));

    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen p-6 bg-background text-text">
      <PageHeader
        title={t("editTask")}
        subtitle={`${t("editingTask")}: ${task.name}`}
        backButtonText={t("backToTask")}
        backButtonPath={() => navigate(`/projects/${projectId}/tasks/${taskId}`)}
        isRTL={isRTL}
      />

      <FormContainer maxWidth="3xl">
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label={`${t("taskName")} *`}
            name="name"
            value={task.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={formErrors.name}
            required
          />

          <TextArea
            label={`${t("description")} *`}
            name="description"
            value={task.description}
            onChange={(e) => handleChange("description", e.target.value)}
            error={formErrors.description}
            rows={4}
            required
          />

          <DateFields
            startDate={task.start_date}
            endDate={task.end_date}
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
              value={task.status}
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
              value={task.evaluation_admin}
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
            value={task.notes_admin}
            onChange={(e) => handleChange("notes_admin", e.target.value)}
            rows={3}
            placeholder={t("optionalNotes")}
          />

          <FormActions
            isRTL={isRTL}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/projects/${projectId}/tasks/${taskId}`)}
            submitText={t("saveChanges")}
            cancelText={t("cancel")}
            submitting={saving}
            submitIcon={<Save size={16} />}
          />
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