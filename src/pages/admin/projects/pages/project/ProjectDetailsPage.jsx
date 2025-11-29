// src/pages/admin/projects/pages/ProjectDetailsPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Edit,
  Calendar,
  User,
  Target,
  FileText,
  Users,
  CheckSquare,
  Plus,
  UserPlus,
  BarChart3,
  Clock,
  CheckCircle,
  ListTodo,
  ChevronRight,
  Eye,
} from "lucide-react";
import { projectService } from "../../services/projectService";
import { taskService } from "../../services/taskService";
import useDarkMode from "../../../../../hooks/useDarkMode";
import Button from "../../../../../components/UI/Button";
import Toast from "../../../../../components/Toast";

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isDark } = useDarkMode();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const isRTL = i18n.language === "ar";

  // Memoized status configuration
  const statusMap = useMemo(
    () => ({
      1: "planning",
      2: "Underimplementation",
      3: "Complete",
      4: "Pause",
      5: "Notimplemented",
    }),
    []
  );

  const statusColors = useMemo(
    () => ({
      planning:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
      Underimplementation:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800",
      Complete:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800",
      Pause:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800",
      Notimplemented:
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800",
    }),
    []
  );

  const taskStatusColors = useMemo(
    () => ({
      0: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      1: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      2: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    }),
    []
  );

  const taskStatusIcons = useMemo(
    () => ({
      0: <Clock size={14} className="text-gray-600" />,
      1: <BarChart3 size={14} className="text-blue-600" />,
      2: <CheckCircle size={14} className="text-green-600" />,
    }),
    []
  );

  const taskStatusText = useMemo(
    () => ({
      0: t("pending"),
      1: t("inProgress"),
      2: t("completed"),
    }),
    [t]
  );

  // Toast handlers
  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  // Status text mapper
  const getStatusText = useCallback(
    (statusNumber) => {
      return statusMap[statusNumber] || "planning";
    },
    [statusMap]
  );

  // Fetch project data
  const fetchProjectDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const result = await projectService.getProjectById(projectId);
      if (!result.project) {
        throw new Error("Project not found");
      }

      setProject({
        ...result.project,
        status: getStatusText(result.project.status),
        project_manager:
          result.project.users?.find((user) => user.role === 1) || null,
      });

      if (result.project.task) {
        // عرض أول 5 مهام فقط
        const recentTasks = result.project.task.slice(0, 5);
        setTasks(recentTasks);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("fetchError");
      setError(errorMessage);
      showToast(errorMessage, "error");
      console.error("Error fetching project details:", error);
    } finally {
      setLoading(false);
    }
  }, [projectId, t, getStatusText, showToast]);

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId, fetchProjectDetails]);

  // Navigation handlers
  const handleAddUsers = useCallback(() => {
    navigate(`/dashboard/projects/${projectId}/users`);
  }, [navigate, projectId]);

  const handleEditProject = useCallback(() => {
    navigate(`/dashboard/projects/${projectId}/edit`);
  }, [navigate, projectId]);

  const handleManageTasks = useCallback(() => {
    navigate(`/dashboard/projects/${projectId}/tasks`);
  }, [navigate, projectId]);

  const handleBackToProjects = useCallback(() => {
    navigate("/dashboard/projects");
  }, [navigate]);

  // Memoized statistics
  const statistics = useMemo(() => {
    const completedTasks = tasks.filter((task) => task.status === 2).length;
    const inProgressTasks = tasks.filter((task) => task.status === 1).length;
    const pendingTasks = tasks.filter((task) => task.status === 0).length;

    return {
      completedTasks,
      inProgressTasks,
      pendingTasks,
      totalTasks: tasks.length,
      teamMembers: project?.users?.length || 0,
    };
  }, [tasks, project]);

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-background flex items-center justify-center">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
          role="status"
          aria-label="Loading">
          <span className="sr-only">{t("loading")}</span>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen p-6 bg-background">
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4" aria-hidden="true">
            ❌
          </div>
          <h2 className="text-2xl font-bold text-text mb-4">
            {error || t("projectNotFound")}
          </h2>
          <Button onClick={handleBackToProjects} className="!w-auto px-6 py-3">
            {t("backToProjects")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-background text-text">
      {/* Header */}
      <header
        className={`flex items-center justify-between mb-8 ${
          isRTL ? "flex-row-reverse" : ""
        }`}>
        <div
          className={`flex items-center gap-4 ${
            isRTL ? "flex-row-reverse" : ""
          }`}>
          <Button
            onClick={handleBackToProjects}
            variant="secondary"
            className={`flex items-center gap-2 !w-auto px-4 py-2 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
            aria-label={t("backToProjects")}>
            <ArrowLeft size={20} />
            <span>{t("backToProjects")}</span>
          </Button>

          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {project.name}
            </h1>
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-medium mt-2 inline-flex items-center gap-1.5 ${
                statusColors[project.status] || statusColors.planning
              }`}
              role="status">
              {project.status === "Complete" ? (
                <CheckCircle size={14} />
              ) : project.status === "Underimplementation" ? (
                <Clock size={14} />
              ) : (
                <BarChart3 size={14} />
              )}
              {t(project.status)}
            </span>
          </div>
        </div>

        <div
          className={`flex items-center gap-3 ${
            isRTL ? "flex-row-reverse" : ""
          }`}>
          <Button
            onClick={handleAddUsers}
            variant="secondary"
            className={`flex items-center gap-2 !w-auto px-4 py-2 ${
              isRTL ? "flex-row-reverse" : ""
            }`}>
            <UserPlus size={20} />
            <span>{t("manageUsers")}</span>
          </Button>

          <Button
            onClick={handleManageTasks}
            className={`flex items-center gap-2 !w-auto px-4 py-2 ${
              isRTL ? "flex-row-reverse" : ""
            }`}>
            <ListTodo size={20} />
            <span>{t("manageTasks")}</span>
          </Button>

          <Button
            onClick={handleEditProject}
            variant="secondary"
            className={`flex items-center gap-2 !w-auto px-4 py-2 ${
              isRTL ? "flex-row-reverse" : ""
            }`}>
            <Edit size={20} />
            <span>{t("editProject")}</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-blue-50/80 to-indigo-100/80 dark:from-gray-800/80 dark:to-gray-700/80 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-600/50 overflow-hidden relative backdrop-blur-sm">
          {/* Animated Background */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 animate-pulse"
            aria-hidden="true"></div>

          {/* Main Panel */}
          <main className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-8">
            {/* Stats Grid */}
            <section
              aria-label="Project statistics"
              className="grid grid-cols-4 gap-6 mb-8">
              <div
                onClick={handleManageTasks}
                className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/30 cursor-pointer hover:shadow-lg transition-shadow">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {statistics.totalTasks}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {t("totalTasks")}
                </div>
              </div>
              <div
                onClick={handleManageTasks}
                className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200/50 dark:border-green-700/30 cursor-pointer hover:shadow-lg transition-shadow">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {statistics.completedTasks}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {t("completed")}
                </div>
              </div>
              <div
                onClick={handleManageTasks}
                className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border border-yellow-200/50 dark:border-yellow-700/30 cursor-pointer hover:shadow-lg transition-shadow">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {statistics.inProgressTasks}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {t("inProgress")}
                </div>
              </div>
              <div
                onClick={handleAddUsers}
                className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/30 cursor-pointer hover:shadow-lg transition-shadow">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {statistics.teamMembers}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {t("teamMembers")}
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description Card */}
                <section className="bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-900/10 dark:to-blue-800/5 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/30 backdrop-blur-sm">
                  <div
                    className={`flex items-center gap-3 mb-4 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}>
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <FileText size={20} className="text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                      {t("projectOverview")}
                    </h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                    {project.description || t("noDescription")}
                  </p>
                </section>

                {/* Recent Tasks Card */}
                <section className="bg-gradient-to-br from-green-50/50 to-green-100/30 dark:from-green-900/10 dark:to-green-800/5 rounded-2xl p-6 border border-green-200/50 dark:border-green-700/30 backdrop-blur-sm">
                  <div
                    className={`flex items-center justify-between mb-4 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}>
                    <div
                      className={`flex items-center gap-3 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}>
                      <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                        <ListTodo size={20} className="text-white" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                        {t("recentTasks")}
                      </h2>
                    </div>
                    <Button
                      onClick={handleManageTasks}
                      variant="ghost"
                      className={`flex items-center gap-2 !w-auto px-3 py-2 text-green-600 hover:text-green-700 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}>
                      <span>{t("viewAllTasks")}</span>
                      <ChevronRight size={16} />
                    </Button>
                  </div>

                  {tasks.length > 0 ? (
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <div
                          key={task.id || task.taskId}
                          className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50 hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3 flex-1">
                            <div
                              className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                                taskStatusColors[task.status] ||
                                taskStatusColors[0]
                              }`}>
                              {taskStatusIcons[task.status]}
                              {taskStatusText[task.status]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-800 dark:text-white truncate">
                                {task.name}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                {task.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {task.success_rate || 0}%
                            </div>
                            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${task.success_rate || 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ListTodo
                        size={48}
                        className="mx-auto text-gray-400 mb-4"
                      />
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        {t("noTasksInProject")}
                      </p>
                      <Button
                        onClick={handleManageTasks}
                        className="flex items-center gap-2 mx-auto">
                        <Plus size={16} />
                        <span>{t("createFirstTask")}</span>
                      </Button>
                    </div>
                  )}
                </section>
              </div>

              {/* Sidebar */}
              <aside className="space-y-6">
                {/* Project Info */}
                <section className="bg-gradient-to-br from-purple-50/50 to-purple-100/30 dark:from-purple-900/10 dark:to-purple-800/5 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/30 backdrop-blur-sm">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    {t("projectDetails")}
                  </h2>

                  <div className="space-y-4">
                    <div
                      className={`flex items-center gap-3 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}>
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Calendar size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t("startDate")}
                        </p>
                        <p className="font-medium text-gray-800 dark:text-white text-sm">
                          {new Date(project.start_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex items-center gap-3 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}>
                      <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                        <Calendar size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t("endDate")}
                        </p>
                        <p className="font-medium text-gray-800 dark:text-white text-sm">
                          {new Date(project.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex items-center gap-3 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}>
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t("projectManager")}
                        </p>
                        <p className="font-medium text-gray-800 dark:text-white text-sm">
                          {project.project_manager?.username || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Progress */}
                <section className="bg-gradient-to-br from-indigo-50/50 to-indigo-100/30 dark:from-indigo-900/10 dark:to-indigo-800/5 rounded-2xl p-6 border border-indigo-200/50 dark:border-indigo-700/30 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                      <BarChart3 size={18} />
                      {t("projectProgress")}
                    </h3>
                    <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {project.success_rate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden mb-2">
                    <div
                      className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-1000 ease-out relative"
                      style={{ width: `${project.success_rate}%` }}
                      role="progressbar"
                      aria-valuenow={project.success_rate}
                      aria-valuemin="0"
                      aria-valuemax="100">
                      <div
                        className="w-full h-full bg-gradient-to-r from-transparent to-white/20 animate-pulse"
                        aria-hidden="true"></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{t("completionRate")}</span>
                    <span>
                      {statistics.completedTasks}/{statistics.totalTasks}{" "}
                      {t("tasksCompleted")}
                    </span>
                  </div>
                </section>
              </aside>
            </div>
          </main>
        </div>
      </div>

      {/* Toast Notification */}
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
