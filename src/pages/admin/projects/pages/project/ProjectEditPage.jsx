import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Save, Users, Flag } from "lucide-react";
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

export default function ProjectEditPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isRTL] = useState(i18n.language === "ar");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [project, setProject] = useState(null);
  const [projectManagerId, setProjectManagerId] = useState("");
  
  // تعريف الحالات مع الترجمات
  const statusOptions = [
    { value: "planning", label: t("statusOptions.planning") },
    { value: "Underimplementation", label: t("statusOptions.Underimplementation") },
    { value: "Complete", label: t("statusOptions.Complete") },
    { value: "Pause", label: t("statusOptions.Pause") },
    { value: "Notimplemented", label: t("statusOptions.Notimplemented") }
  ];

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    project_manager_id: "",
    status: "planning",
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
    fetchUsers();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const result = await projectService.getProjectById(projectId);

      console.log("Project API Response:", result);

      if (result && result.project) {
        const projectData = result.project;
        setProject(projectData);

        // البحث عن ID المدير بناءً على الاسم
        let managerId = "";
        if (projectData.projectManagerName && users.length > 0) {
          const foundUser = users.find(
            user => user.userData?.username === projectData.projectManagerName
          );
          if (foundUser) {
            managerId = foundUser.value;
          }
        }

        setFormData({
          name: projectData.name || "",
          description: projectData.description || "",
          project_manager_id: managerId,
          status: projectData.status || "planning",
          start_date: projectData.start_date?.split("T")[0] || "",
          end_date: projectData.end_date?.split("T")[0] || "",
          notes: projectData.notes || "",
        });

        setProjectManagerId(managerId);

        console.log("Project loaded:", {
          name: projectData.name,
          projectManagerName: projectData.projectManagerName,
          managerId: managerId
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
      } else if (response && response.users && Array.isArray(response.users)) {
        usersData = response.users;
      }

      console.log("Raw users data:", usersData);

      // تصفية المستخدمين النشطين مع دور Admin
      const activeUsers = usersData.filter(
        (user) => !user.isDeleted && (user.role === "Admin" || user.role === "admin")
      );

      console.log("Active Admins:", activeUsers);

      // عرض اسم المستخدم فقط بدون الإيميل
      const formattedUsers = activeUsers.map((user) => {
        return {
          value: user.id.toString(),
          label: user.username, // اسم المستخدم فقط
          userData: user,
        };
      });

      console.log("Formatted users for dropdown:", formattedUsers);
      setUsers(formattedUsers);

      // إذا كان هناك مشروع محمل، حاول مطابقة المدير
      if (project && project.projectManagerName) {
        const foundUser = formattedUsers.find(
          u => u.userData?.username === project.projectManagerName
        );
        if (foundUser) {
          setProjectManagerId(foundUser.value);
          setFormData(prev => ({
            ...prev,
            project_manager_id: foundUser.value
          }));
        }
      }
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

  // إعادة جلب المشروع عند تحميل المستخدمين
  useEffect(() => {
    if (users.length > 0 && project) {
      findAndSetProjectManager();
    }
  }, [users, project]);

  const findAndSetProjectManager = () => {
    if (project && project.projectManagerName && users.length > 0) {
      const foundUser = users.find(
        user => user.userData?.username === project.projectManagerName
      );
      if (foundUser) {
        const managerId = foundUser.value;
        setProjectManagerId(managerId);
        setFormData(prev => ({
          ...prev,
          project_manager_id: managerId
        }));
        console.log("Found and set manager:", {
          name: project.projectManagerName,
          id: managerId
        });
      }
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
        status: formData.status,
        start_date: formData.start_date,
        end_date: formData.end_date,
        notes: formData.notes || "",
      };

      console.log("Submitting project data:", projectData);

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
    console.log(`Field ${field} changed to:`, value, `(type: ${typeof value})`);
    
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === 'project_manager_id') {
      setProjectManagerId(value);
    }

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
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dropdown لاختيار مدير المشروع - مع label معدل */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  {t("projectManager")} <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  name="project_manager_id"
                  value={formData.project_manager_id || ""}
                  onChange={(value) => {
                    console.log("Manager selected:", value);
                    handleChange("project_manager_id", value);
                  }}
                  options={users}
                  placeholder={
                    loadingUsers ? t("loadingUsers") : t("selectProjectManager")
                  }
                  loading={loadingUsers}
                  icon={<Users size={16} />}
                  helpText={t("selectManagerHelp")}
                  allowClear
                  noOptionsMessage={() => t("noUsersAvailable")}
                  isSearchable={true}
                  className="w-full"
                />
                {formData.project_manager_id && (
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                    ✓ {t("managerSelected")}
                  </div>
                )}
              </div>

              {/* Dropdown للحالة (Status) - مع label معدل */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  {t("status")} <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  name="status"
                  value={formData.status}
                  onChange={(value) => handleChange("status", value)}
                  options={statusOptions}
                  placeholder={t("selectStatus")}
                  icon={<Flag size={16} />}
                  helpText={t("selectStatusHelp")}
                  isSearchable={false}
                  className="w-full"
                />
              </div>
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