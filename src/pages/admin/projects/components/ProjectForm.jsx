// src/components/Projects/ProjectForm/ProjectForm.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import InputField from "../../../../components/UI/InputField";
import Dropdown from "../../../../components/UI/Dropdown";
import TextAreaField from "../../../../components/UI/TextAreaField";
import FormActions from "../../../../components/UI/FormActions";
import { userService } from "../../users/services/userService";

export default function ProjectForm({
  project,
  onSubmit,
  onClose,
  isSubmitting,
  isRTL,
}) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    project_Manager_id: "",
    status: "planning",
    start_date: "",
    end_date: "",
    notes: ""
  });

  const [errors, setErrors] = useState({});
  const [managers, setManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);

  const isEditing = !!project;

  // جلب مديري المشاريع
  useEffect(() => {
    const fetchManagers = async () => {
      setLoadingManagers(true);
      try {
        const result = await userService.getUsers({ role: "Admin" });
        setManagers(result.data || []);
      } catch (error) {
        console.error("Error fetching managers:", error);
      } finally {
        setLoadingManagers(false);
      }
    };

    fetchManagers();
  }, []);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
        project_Manager_id: project.project_manager?.id?.toString() || "",
        status: project.status || "planning",
        start_date: project.start_date ? project.start_date.split('T')[0] : "",
        end_date: project.end_date ? project.end_date.split('T')[0] : "",
        notes: project.notes || ""
      });
    }
  }, [project]);

  const setField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t("projectNameRequired");
    }

    if (!formData.description.trim()) {
      newErrors.description = t("projectDescriptionRequired");
    }

    if (!formData.project_Manager_id) {
      newErrors.project_Manager_id = t("projectManagerRequired");
    }

    if (!formData.start_date) {
      newErrors.start_date = t("startDateRequired");
    }

    if (!formData.end_date) {
      newErrors.end_date = t("endDateRequired");
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (endDate < startDate) {
        newErrors.end_date = t("endDateAfterStartDate");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // تحويل project_Manager_id إلى number
      const submitData = {
        ...formData,
        project_Manager_id: parseInt(formData.project_Manager_id)
      };
      
      onSubmit(submitData);
    }
  };

  // خيارات الحالة
  const statusOptionsOnCreate = [
    { value: "planning", label: t("planning") },
    { value: "Underimplementation", label: t("underImplementation") },
  ];

  const statusOptionsOnEdit = [
    { value: "planning", label: t("planning") },
    { value: "Underimplementation", label: t("underImplementation") },
    { value: "Complete", label: t("complete") },
    { value: "Pause", label: t("pause") },
    { value: "Notimplemented", label: t("notImplemented") },
  ];

  // استخدام الخيارات المناسبة حسب الوضع
  const statusOptions = isEditing ? statusOptionsOnEdit : statusOptionsOnCreate;

  // خيارات مديري المشاريع
  const managerOptions = managers.map(manager => ({
    value: manager.id.toString(),
    label: manager.username
  }));

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-6 max-w-md mx-auto"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* معلومات المشروع للعرض فقط في وضع التعديل */}
      {isEditing && project && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
            {t("projectInformation")}
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-blue-700 dark:text-blue-400">{t("createdBy")}: </span>
              <span className="text-blue-900 dark:text-blue-200">{project.project_manager?.username}</span>
            </div>
            <div>
              <span className="font-medium text-blue-700 dark:text-blue-400">{t("successRate")}: </span>
              <span className="text-blue-900 dark:text-blue-200">{project.success_rate}%</span>
            </div>
          </div>
        </div>
      )}

      {/* حقول المشروع */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
        <InputField
          label={t("projectName")}
          placeholder={t("enterProjectName")}
          value={formData.name}
          onChange={(e) => setField("name", e.target.value)}
          error={errors.name}
          dir={isRTL ? "rtl" : "ltr"}
          required
        />

        <TextAreaField
          label={t("description")}
          placeholder={t("enterProjectDescription")}
          value={formData.description}
          onChange={(e) => setField("description", e.target.value)}
          error={errors.description}
          dir={isRTL ? "rtl" : "ltr"}
          rows={3}
          required
        />

        {/* مدير المشروع */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("projectManager")} *
          </label>
          <Dropdown
            options={managerOptions}
            value={formData.project_Manager_id}
            onChange={(value) => setField("project_Manager_id", value)}
            placeholder={loadingManagers ? t("loadingManagers") : t("selectManager")}
            isRTL={isRTL}
            className="w-full"
            disabled={loadingManagers}
          />
          {errors.project_Manager_id && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.project_Manager_id}</p>
          )}
        </div>

        {/* حالة المشروع */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("status")}
          </label>
          <Dropdown
            options={statusOptions}
            value={formData.status}
            onChange={(value) => setField("status", value)}
            placeholder={t("selectStatus")}
            isRTL={isRTL}
            className="w-full"
          />
        </div>

        {/* تاريخ البدء */}
        <InputField
          label={t("startDate")}
          value={formData.start_date}
          onChange={(e) => setField("start_date", e.target.value)}
          error={errors.start_date}
          dir={isRTL ? "rtl" : "ltr"}
          type="date"
          required
        />

        {/* تاريخ الانتهاء */}
        <InputField
          label={t("endDate")}
          value={formData.end_date}
          onChange={(e) => setField("end_date", e.target.value)}
          error={errors.end_date}
          dir={isRTL ? "rtl" : "ltr"}
          type="date"
          required
        />

        {/* ملاحظات */}
        <TextAreaField
          label={t("notes")}
          placeholder={t("enterNotes")}
          value={formData.notes}
          onChange={(e) => setField("notes", e.target.value)}
          error={errors.notes}
          dir={isRTL ? "rtl" : "ltr"}
          rows={2}
        />
      </div>

      {/* Form actions */}
      <FormActions
        onClose={onClose}
        isSubmitting={isSubmitting}
        isEditing={isEditing}
        isRTL={isRTL}
        submitText={isEditing ? t("updateProject") : t("createProject")}
      />
    </form>
  );
}