// src/pages/admin/projects/pages/TaskCreatePage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Save } from "lucide-react";
import { taskService } from "../../services/taskService";
import { projectService } from "../../services/projectService";
import useDarkMode from "../../../../../hooks/useDarkMode";

export default function TaskCreatePage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isDark } = useDarkMode();

  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    project_id: parseInt(projectId),
    successrate: 0,
    status: "1",
    startdate: "",
    enddate: "",
    evaluationAdmin: 0,
    notesadmin: "",
  });

  const isRTL = i18n.language === "ar";

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const result = await projectService.getProjectById(projectId);
        if (result.project) {
          setProject(result.project);
          setUsers(result.project.users || []);
        }
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };

    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await taskService.createTask({
        ...formData,
        project_id: parseInt(projectId),
        successrate: parseInt(formData.successrate),
        evaluationAdmin: parseInt(formData.evaluationAdmin),
      });

      navigate(`/dashboard/projects/${projectId}`);
    } catch (error) {
      console.error("Error creating task:", error);
      alert(t("createError"));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Header */}
      <div
        className={`flex items-center justify-between mb-6 ${
          isRTL ? "flex-row-reverse" : ""
        }`}>
        <div
          className={`flex items-center gap-4 ${
            isRTL ? "flex-row-reverse" : ""
          }`}>
          <button
            onClick={() => navigate(`/dashboard/projects/${projectId}`)}
            className={`flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              isRTL ? "flex-row-reverse" : ""
            }`}>
            <ArrowLeft size={20} />
            <span>{t("backToProject")}</span>
          </button>

          <div>
            <h1 className="text-3xl font-bold">{t("addNewTask")}</h1>
            {project && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t("forProject")}: {project.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Task Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("taskName")} *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder={t("enterTaskName")}
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("description")}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder={t("enterTaskDescription")}
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("startDate")} *
              </label>
              <input
                type="datetime-local"
                name="startdate"
                value={formData.startdate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("endDate")} *
              </label>
              <input
                type="datetime-local"
                name="enddate"
                value={formData.enddate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("status")}
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                <option value="1">{t("pending")}</option>
                <option value="2">{t("inProgress")}</option>
                <option value="3">{t("completed")}</option>
              </select>
            </div>

            {/* Success Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("successRate")} (%)
              </label>
              <input
                type="number"
                name="successrate"
                value={formData.successrate}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Admin Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("adminNotes")}
              </label>
              <textarea
                name="notesadmin"
                value={formData.notesadmin}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder={t("enterAdminNotes")}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div
            className={`flex justify-end mt-6 ${
              isRTL ? "flex-row-reverse" : ""
            }`}>
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isRTL ? "flex-row-reverse" : ""
              }`}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save size={20} />
              )}
              <span>{t("createTask")}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
