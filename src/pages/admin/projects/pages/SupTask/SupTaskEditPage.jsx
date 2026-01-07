// SupTaskEditPage.jsx
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

export default function SupTaskEditPage() {
  const { projectId, taskId, supTaskId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isRTL] = useState(i18n.language === "ar");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [supTask, setSupTask] = useState(null);
  const [task, setTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    user_id: "",
    status: "Notimplemented",
    user_notes: ""
  });

  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // خيارات الحالة
  const statusOptions = [
    { value: "Notimplemented", label: t("notImplemented") },
    { value: "Underimplementation", label: t("underImplementation") },
    { value: "Complete", label: t("completed") },
    { value: "Pause", label: t("paused") },
  ];

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

      // جلب بيانات المهمة الرئيسية
      const taskData = await taskService.getTaskById(taskId);
      setTask(taskData);

      // جلب بيانات المهمة الفرعية
      const supTaskData = await supTaskService.getSupTaskById(supTaskId);
      setSupTask(supTaskData);

      // جلب قائمة المستخدمين
      const usersResponse = await userService.getUsers();
      setUsers(usersResponse.data || []);

      // تعيين بيانات النموذج
      setFormData({
        name: supTaskData.name || "",
        description: supTaskData.description || "",
        start_date: supTaskData.start_date?.split('T')[0] || "",
        end_date: supTaskData.end_date?.split('T')[0] || "",
        user_id: supTaskData.user_id ? supTaskData.user_id.toString() : "",
        status: supTaskData.status_string || "Notimplemented",
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

  // الحصول على اسم المستخدم المعين
  const getAssignedUserName = () => {
    if (!formData.user_id) return "";
    
    const user = users.find(u => u.id.toString() === formData.user_id);
    if (user) {
      return user.name 
        ? `${user.name} (${user.email})`
        : `${user.username} (${user.email})`;
    }
    return t("user") + " #" + formData.user_id;
  };

  // تحضير خيارات المستخدمين
  const userOptions = [
    { value: "", label: t("selectUser") },
    ...users.filter(user => !user.isDeleted).map(user => ({
      value: user.id.toString(),
      label: user.name 
        ? `${user.name} (${user.email}) - ${user.role}`
        : `${user.username} (${user.email}) - ${user.role}`
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
        user_notes: formData.user_notes,
        status: formData.status
      };

      console.log("📤 Updating sup task data:", supTaskData);
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
            {/* اسم المهمة الفرعية */}
            <Input
              label={`${t("supTaskName")} *`}
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              error={formErrors.name}
              required
            />

            {/* الوصف */}
            <TextArea
              label={`${t("description")} *`}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              error={formErrors.description}
              rows={4}
              required
            />

            {/* التواريخ */}
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
              {/* الحالة باستخدام Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-2 text-text">
                  {t("status")} *
                </label>
                <Dropdown
                  options={statusOptions}
                  value={formData.status}
                  onChange={(value) => handleChange("status", value)}
                  placeholder={t("selectStatus")}
                  isRTL={isRTL}
                />
                {formErrors.status && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.status}</p>
                )}
              </div>

              {/* تعيين مستخدم باستخدام Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-2 text-text">
                  {t("assignedTo")}
                </label>
                <div className="mb-2">
                  {formData.user_id ? (
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        <span className="font-medium">{t("currentlyAssigned")}:</span>{" "}
                        {getAssignedUserName()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("noUserAssigned")}
                    </p>
                  )}
                </div>
                <Dropdown
                  options={userOptions}
                  value={formData.user_id}
                  onChange={(value) => handleChange("user_id", value)}
                  placeholder={t("changeUser")}
                  isRTL={isRTL}
                  searchable={true}
                />
                <p className="text-gray-500 text-sm mt-1">
                  {formData.user_id ? 
                    t("changeUserHelp") : 
                    t("assignUserHelp")
                  }
                </p>
              </div>
            </div>

            {/* ملاحظات المستخدم */}
            <TextArea
              label={t("userNotes")}
              value={formData.user_notes}
              onChange={(e) => handleChange("user_notes", e.target.value)}
              rows={3}
              placeholder={t("enterUserNotes")}
              helpText={t("userNotesHelp")}
            />

            {/* أزرار الحفظ والإلغاء */}
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

      {/* رسائل التنبيه */}
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