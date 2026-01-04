import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Save } from "lucide-react";
import { supTaskService } from "../../services/supTaskService";
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

export default function SupTaskEditPage() {
  const { projectId, taskId, supTaskId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isRTL] = useState(i18n.language === "ar");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [supTask, setSupTask] = useState(null);
  const [task, setTask] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    user_id: "",
    status: 0,
    completed: false,
    user_notes: ""
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
    fetchSupTaskDetails();
  }, [supTaskId, taskId]);

  const fetchSupTaskDetails = async () => {
    try {
      setLoading(true);

      const taskData = await taskService.getTaskById(taskId);
      setTask(taskData);

      const supTaskData = await supTaskService.getSupTaskById(supTaskId);
      setSupTask(supTaskData);

      setFormData({
        name: supTaskData.name || "",
        description: supTaskData.description || "",
        start_date: supTaskData.start_date?.split('T')[0] || "",
        end_date: supTaskData.end_date?.split('T')[0] || "",
        user_id: supTaskData.user_id || "",
        status: supTaskData.status || 0,
        completed: supTaskData.completed || false,
        user_notes: supTaskData.user_notes || ""
      });

    } catch (error) {
      const errorMessage = error.response?.data?.message || t("fetchError");
      showToast(errorMessage, "error");
      console.error("Error fetching sup task details:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = t("supTaskNameRequired");
    }

    if (!formData.description.trim()) {
      errors.description = t("supTaskDescriptionRequired");
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
      const supTaskData = {
        name: formData.name,
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.end_date,
        user_id: formData.user_id ? parseInt(formData.user_id) : 0,
        completed: formData.completed,
        user_notes: formData.user_notes,
        status: parseInt(formData.status)
      };

      await supTaskService.updateSupTask(supTaskId, supTaskData);

      showToast(t("supTaskUpdatedSuccessfully"), "success");
      
      setTimeout(() => {
        navigate(`/projects/${projectId}/tasks/${taskId}/subtasks/${supTaskId}`);
      }, 1500);
    } catch (error) {
      console.error("Error updating sup task:", error);
      showToast(error.response?.data?.message || t("updateError"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === 'status') {
      const statusValue = parseInt(value);
      setFormData(prev => ({
        ...prev,
        completed: statusValue === 2,
        [field]: statusValue
      }));
    }

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

  if (!supTask || !task) {
    return (
      <div className="min-h-screen p-6 bg-background">
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4" aria-hidden="true">
            ❌
          </div>
          <h2 className="text-2xl font-bold text-text mb-4">
            {t("supTaskNotFound")}
          </h2>
          <button
            onClick={() => navigate(`/projects/${projectId}/tasks/${taskId}/subtasks`)}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors"
          >
            {t("backToSupTasks")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-background text-text">
      <PageHeader
        title={t("editSupTask")}
        subtitle={`${t("editingSupTask")}: ${supTask.name}`}
        backButtonText={t("backToSupTask")}
        backButtonPath={() => navigate(`/projects/${projectId}/tasks/${taskId}/subtasks/${supTaskId}`)}
        isRTL={isRTL}
      />

      <FormContainer maxWidth="3xl">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <Input
              label={`${t("supTaskName")} *`}
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              error={formErrors.name}
              required
            />

            <TextArea
              label={`${t("description")} *`}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              error={formErrors.description}
              rows={4}
              required
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
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value={0}>{t("pending")}</option>
                <option value={1}>{t("inProgress")}</option>
                <option value={2}>{t("completed")}</option>
              </Select>

              <Input
                type="number"
                label={t("assignedUserId")}
                value={formData.user_id}
                onChange={(e) => handleChange("user_id", e.target.value)}
                min="0"
                placeholder={t("enterUserId")}
                helpText={t("userIdHelp")}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="completed"
                checked={formData.completed}
                onChange={(e) => handleChange("completed", e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="completed" className="text-sm text-gray-700 dark:text-gray-300">
                {t("markAsCompleted")}
              </label>
            </div>

            <TextArea
              label={t("userNotes")}
              value={formData.user_notes}
              onChange={(e) => handleChange("user_notes", e.target.value)}
              rows={3}
              placeholder={t("enterUserNotes")}
            />

            <FormActions
              isRTL={isRTL}
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/projects/${projectId}/tasks/${taskId}/subtasks/${supTaskId}`)}
              submitText={t("saveChanges")}
              cancelText={t("cancel")}
              submitting={submitting}
              submitIcon={<Save size={16} />}
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