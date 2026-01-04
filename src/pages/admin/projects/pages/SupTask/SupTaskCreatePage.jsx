import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Save } from "lucide-react";
import { supTaskService } from "../../services/supTaskService";
import { taskService } from "../../services/taskService";
import { userService } from "../../../users/services/userService";
import PageHeader from "../../../../../components/common/PageHeader";
import FormContainer from "../../../../../components/common/FormContainer";
import FormActions from "../../../../../components/common/FormActions";
import DateFields from "../../../../../components/common/DateFields";
import Input from "../../../../../components/UI/InputField";
import TextArea from "../../../../../components/UI/TextAreaField";
import Dropdown from "../../../../../components/UI/Dropdown";
import Toast from "../../../../../components/Toast";
import LoadingSpinner from "../../../../../components/UI/LoadingSpinner";

export default function SupTaskCreatePage() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isRTL] = useState(i18n.language === "ar");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [task, setTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    user_id: "",
    status: "pending",
  });

  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const statusOptions = [
    { value: "pending", label: t("pending") },
    { value: "in_progress", label: t("inProgress") },
    { value: "completed", label: t("completed") },
    { value: "cancelled", label: t("cancelled") },
  ];

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const taskData = await taskService.getTaskById(taskId);
        setTask(taskData);
        
        const usersResponse = await userService.getUsers();
        setUsers(usersResponse.data || []);
        
        const activeUsers = (usersResponse.data || []).filter(
          user => !user.isDeleted
        );
        setFilteredUsers(activeUsers);
        
        if (taskData.start_date && taskData.end_date) {
          setFormData(prev => ({
            ...prev,
            start_date: taskData.start_date.split('T')[0],
            end_date: taskData.end_date.split('T')[0]
          }));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        showToast(error.response?.data?.message || t("fetchError"), "error");
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchData();
    }
  }, [taskId, t]);

  const userOptions = [
    { value: "", label: t("selectUser") },
    ...filteredUsers.map(user => ({
      value: user.id.toString(),
      label: `${user.username} (${user.email}) - ${user.role}`
    }))
  ];

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

    if (!formData.status) {
      errors.status = t("statusRequired");
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
        name: formData.name.trim(),
        description: formData.description.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
        user_id: formData.user_id ? parseInt(formData.user_id) : null,
        status: formData.status,
        taskid: parseInt(taskId),
      };

      await supTaskService.createSupTask(supTaskData);

      showToast(t("supTaskCreatedSuccessfully"), "success");
      
      setTimeout(() => {
        navigate(`/projects/${projectId}/tasks/${taskId}/subtasks`);
      }, 1500);
    } catch (error) {
      console.error("Error creating sup task:", error);
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

  const handleSelectChange = (field, value) => {
    handleChange(field, value);
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!task) {
    return (
      <div className="min-h-screen p-6 bg-background">
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4" aria-hidden="true">
            ❌
          </div>
          <h2 className="text-2xl font-bold text-text mb-4">
            {t("taskNotFound")}
          </h2>
          <button
            onClick={() => navigate(`/projects/${projectId}/tasks`)}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors"
          >
            {t("backToTasks")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-background text-text">
      <PageHeader
        title={t("addNewSupTask")}
        subtitle={`${t("forTask")}: ${task.name}`}
        backButtonText={t("backToSupTasks")}
        backButtonPath={() => navigate(`/projects/${projectId}/tasks/${taskId}/subtasks`)}
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
              placeholder={t("enterSupTaskName")}
            />

            <TextArea
              label={`${t("description")} *`}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              error={formErrors.description}
              rows={4}
              required
              placeholder={t("enterSupTaskDescription")}
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
              {/* حقل الحالة (Status) باستخدام Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-2 text-text">
                  {t("status")} *
                </label>
                <Dropdown
                  options={statusOptions}
                  value={formData.status}
                  onChange={(value) => handleSelectChange("status", value)}
                  placeholder={t("selectStatus")}
                  isRTL={isRTL}
                />
                {formErrors.status && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.status}</p>
                )}
              </div>

              {/* حقل المستخدم (Assigned To) باستخدام Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-2 text-text">
                  {t("assignedTo")}
                </label>
                <Dropdown
                  options={userOptions}
                  value={formData.user_id}
                  onChange={(value) => handleSelectChange("user_id", value)}
                  placeholder={t("selectUser")}
                  isRTL={isRTL}
                />
                <p className="text-gray-500 text-sm mt-1">{t("userSelectionHelp")}</p>
              </div>
            </div>

            <FormActions
              isRTL={isRTL}
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/projects/${projectId}/tasks/${taskId}/subtasks`)}
              submitText={t("createSupTask")}
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