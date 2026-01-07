import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Save, Users } from "lucide-react";
import { projectService } from "../../services/projectService";
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

export default function ProjectCreatePage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isRTL] = useState(i18n.language === "ar");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    project_manager_id: "",
    status: 1,
    start_date: "",
    end_date: "",
    notes: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);

      const response = await userService.getUsers();

      console.log("Users API Response:", response);

      let usersData = [];

      if (response && response.data && Array.isArray(response.data)) {
        usersData = response.data;
      } else if (Array.isArray(response)) {
        usersData = response;
      }

      const activeUsers = usersData.filter(
        (user) => !user.isDeleted && user.role === "Admin"
      );

      const formattedUsers = activeUsers.map((user) => {
        return {
          value: user.id.toString(),
          label: `${user.username}`,
          userData: user, // حفظ البيانات الكاملة
        };
      });

      console.log("Formatted users for dropdown:", formattedUsers);
      setUsers(formattedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      showToast(
        error.response?.data?.message || t("failedToLoadUsers"),
        "error"
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = t("projectNameRequired");
    }

    if (!formData.description.trim()) {
      errors.description = t("projectDescriptionRequired");
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
      const projectData = {
        ...formData,
        project_manager_id: formData.project_manager_id
          ? parseInt(formData.project_manager_id)
          : null,
        status: parseInt(formData.status),
      };

      console.log("Submitting project data:", projectData);

      const result = await projectService.createProject(projectData);

      showToast(t("projectCreatedSuccessfully"), "success");

      setTimeout(() => {
        navigate(`/projects/${result.id || result.data?.id}`);
      }, 1500);
    } catch (error) {
      console.error("Error creating project:", error);
      showToast(error.response?.data?.message || t("createError"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    console.log(`Changing ${field} to:`, value);
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

  return (
    <div className="min-h-screen p-6 bg-background text-text">
      <PageHeader
        title={t("createNewProject")}
        subtitle={t("createProjectDescription")}
        backButtonText={t("backToProjects")}
        backButtonPath={() => navigate(`/projects`)}
        isRTL={isRTL}
      />

      <FormContainer maxWidth="3xl">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <Input
              label={`${t("projectName")} *`}
              name="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              error={formErrors.name}
              required
              placeholder={t("enterProjectName")}
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
              placeholder={t("enterProjectDescription")}
            />

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <Dropdown
                label={t("projectManager")}
                name="project_manager_id"
                value={formData.project_manager_id}
                onChange={(value) => handleChange("project_manager_id", value)}
                options={users}
                placeholder={
                  loadingUsers ? t("loadingUsers") : t("selectProjectManager")
                }
                error={formErrors.description}
                loading={loadingUsers}
                icon={<Users size={16} />}
                helpText={t("selectManagerHelp")}
                allowClear
                noOptionsMessage={() => t("noUsersAvailable")}
                isSearchable={true}
                className="w-full"
                required
              />
            </div>

            <DateFields
              startDate={formData.start_date}
              endDate={formData.end_date}
              onStartDateChange={(e) =>
                handleChange("start_date", e.target.value)
              }
              onEndDateChange={(e) => handleChange("end_date", e.target.value)}
              startDateError={formErrors.start_date}
              endDateError={formErrors.end_date}
              t={t}
              isRTL={isRTL}
            />

            <TextArea
              label={t("notes")}
              name="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={3}
              placeholder={t("enterProjectNotes")}
            />

            <FormActions
              isRTL={isRTL}
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/projects`)}
              submitText={t("createProject")}
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
