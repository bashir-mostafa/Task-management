import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Save } from "lucide-react";
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

export default function ProjectEditPage() {
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

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const result = await projectService.getProjectById(projectId);

      if (result && result.project) {
        const projectData = result.project;
        setProject(projectData);

        setFormData({
          name: projectData.name || "",
          description: projectData.description || "",
          project_manager_id: projectData.project_manager_id || "",
          status: projectData.status || 1,
          start_date: projectData.start_date?.split("T")[0] || "",
          end_date: projectData.end_date?.split("T")[0] || "",
          notes: projectData.notes || "",
        });
      } else if (result) {
        setProject(result);
        setFormData({
          name: result.name || "",
          description: result.description || "",
          project_manager_id: result.project_manager_id || "",
          status: result.status || 1,
          start_date: result.start_date?.split("T")[0] || "",
          end_date: result.end_date?.split("T")[0] || "",
          notes: result.notes || "",
        });
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

  const validateForm = useCallback(() => {
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
  }, [formData, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast(t("pleaseFixErrors"), "error");
      return;
    }

    setSubmitting(true);

    try {
      const projectData = {
        name: formData.name,
        description: formData.description,
        project_manager_id: formData.project_manager_id
          ? parseInt(formData.project_manager_id)
          : null,
        status: parseInt(formData.status),
        start_date: formData.start_date,
        end_date: formData.end_date,
        notes: formData.notes || "",
      };

      await projectService.updateProject(projectId, projectData);

      showToast(t("projectUpdatedSuccessfully"), "success");

      setTimeout(() => {
        navigate(`/projects/${projectId}`);
      }, 1500);
    } catch (error) {
      console.error("❌ Error updating project:", error);
      const errorMessage = error.response?.data?.message || t("updateError");
      showToast(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
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
            onClick={() => navigate("/projects")}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors">
            {t("backToProjects")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-background text-text">
      <PageHeader
        title={`${t("editProject")}: ${project.name}`}
        subtitle={t("editProjectDescription")}
        backButtonText={t("backToProject")}
        backButtonPath={() => navigate(`/projects/${projectId}`)}
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
            />

            <TextArea
              label={`${t("description")} *`}
              name="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              error={formErrors.description}
              rows={4}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                type="number"
                label={t("projectManagerId")}
                name="project_manager_id"
                value={formData.project_manager_id}
                onChange={(e) =>
                  handleChange("project_manager_id", e.target.value)
                }
                min="0"
                placeholder={t("enterManagerId")}
                helpText={t("managerIdHelp")}
              />

              <Select
                label={t("status")}
                name="status"
                value={formData.status}
                onChange={(e) =>
                  handleChange("status", parseInt(e.target.value))
                }>
                <option value={0}>{t("inactive")}</option>
                <option value={1}>{t("active")}</option>
                <option value={2}>{t("completed")}</option>
              </Select>
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
              onCancel={() => navigate(`/projects/${projectId}`)}
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
