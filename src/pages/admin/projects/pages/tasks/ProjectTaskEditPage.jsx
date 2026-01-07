import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Save, Star, Flag } from "lucide-react";
import { taskService } from "../../services/taskService";
import PageHeader from "../../../../../components/common/PageHeader";
import FormContainer from "../../../../../components/common/FormContainer";
import FormActions from "../../../../../components/common/FormActions";
import Input from "../../../../../components/UI/InputField";
import TextArea from "../../../../../components/UI/TextAreaField";
import Dropdown from "../../../../../components/UI/Dropdown";
import Toast from "../../../../../components/Toast";
import LoadingSpinner from "../../../../../components/UI/LoadingSpinner";

export default function ProjectTaskEditPage() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  const [task, setTask] = useState({
    name: "",
    description: "",
    status: "Notimplemented",
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
  const [hoveredStar, setHoveredStar] = useState(0);

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

  // تعريف الحالات بناءً على الـ Enum
  const statusOptions = [
    { value: "Notimplemented", label: t("statusOptions.Notimplemented") },
    { value: "Underimplementation", label: t("statusOptions.underImplementation") },
    { value: "Complete", label: t("statusOptions.completed") },
    { value: "Pause", label: t("statusOptions.paused") }
  ];

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
          status: response.status || "Notimplemented",
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

    // التحقق فقط إذا كان كلا التاريخين موجودين
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
      // تحضير البيانات لإرسالها
      const taskData = {
        name: task.name.trim(),
        description: task.description.trim(),
        status: task.status,
        notes_admin: task.notes_admin?.trim() || "",
        project_id: parseInt(projectId),
      };

      // إضافة التقييم إذا كان موجوداً
      if (task.evaluation_admin) {
        taskData.evaluation_admin = parseFloat(task.evaluation_admin);
      }

      // إضافة التواريخ فقط إذا كانت موجودة وغير فارغة
      if (task.start_date && task.start_date.trim()) {
        taskData.start_date = task.start_date;
      }
      // إذا كان فارغاً لا نرسل الحقل أصلاً (ستحتفظ القيمة الحالية)

      if (task.end_date && task.end_date.trim()) {
        taskData.end_date = task.end_date;
      }
      // إذا كان فارغاً لا نرسل الحقل أصلاً (ستحتفظ القيمة الحالية)

      console.log("Updating task with data:", taskData);

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
    console.log(`Changing ${field} to:`, value);
    setTask(prev => ({ ...prev, [field]: value }));

    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleStarClick = (value) => {
    setTask(prev => ({ ...prev, evaluation_admin: value }));
  };

  const renderStars = () => {
    const stars = [];
    const currentValue = parseFloat(task.evaluation_admin) || 0;
    
    for (let i = 1; i <= 5; i++) {
      const isFilled = hoveredStar ? i <= hoveredStar : i <= currentValue;
      const isHalf = !hoveredStar && (i - 0.5 <= currentValue && currentValue < i);
      
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => setHoveredStar(i)}
          onMouseLeave={() => setHoveredStar(0)}
          className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        >
          <Star
            size={28}
            className={
              isFilled
                ? "text-yellow-500 fill-yellow-500"
                : isHalf
                ? "text-yellow-500 fill-yellow-500 opacity-50"
                : "text-gray-300 dark:text-gray-600"
            }
          />
        </button>
      );
    }
    
    return stars;
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
            isRTL={isRTL}
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

          {/* التواريخ - اختيارية */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
              {t("dates")} ({t("optional")})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  {t("startDate")}
                </label>
                <input
                  type="date"
                  value={task.start_date || ""}
                  onChange={(e) => handleChange("start_date", e.target.value)}
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
                  value={task.end_date || ""}
                  onChange={(e) => handleChange("end_date", e.target.value)}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dropdown للحالة */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                {t("status")} *
              </label>
              <Dropdown
                label=""
                name="status"
                value={task.status}
                onChange={(value) => handleChange("status", value)}
                options={statusOptions}
                placeholder={t("selectStatus")}
                icon={<Flag size={16} />}
                helpText={t("selectStatusHelp")}
                isSearchable={false}
                className="w-full"
              />
            </div>

            {/* نظام النجوم للتقييم */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                {t("evaluation")} (0-5)
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {renderStars()}
                </div>
                <div className="ml-2">
                  <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    {task.evaluation_admin || 0}/5
                  </span>
                </div>
              </div>
              <input
                type="hidden"
                name="evaluation_admin"
                value={task.evaluation_admin}
              />
              <div className="flex gap-2 mt-2">
                {[0, 1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleStarClick(value)}
                    className={`px-2 py-1 text-xs rounded ${
                      parseFloat(task.evaluation_admin) === value
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t("clickToRate")}
              </div>
            </div>
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