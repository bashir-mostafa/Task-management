// src/pages/admin/projects/pages/ProjectDetailsPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Plus,
  ChevronRight,
  Calendar,
  User,
  Target,
  BarChart3,
  ListTodo,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  Edit,
  Users,
  ArrowLeft,
} from "lucide-react";

import { projectService } from "../../../../admin/projects/services/projectService";
import { taskService } from "../../../../admin/projects/services/taskService";
import { userProjectService } from "../../../../admin/projects/services/userProjectService";

import DetailsLayout from "../../../../../components/Layout/DetailsLayout";
import DetailsCard from "../../../../../components/UI/DetailsCard";
import StatCard from "../../../../../components/UI/StatCard";
import ProgressBar from "../../../../../components/UI/ProgressBar";
import DetailItem from "../../../../../components/UI/DetailItem";
import Button from "../../../../../components/UI/Button";
import Toast from "../../../../../components/Toast";

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projectUsers, setProjectUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const isRTL = i18n.language === "ar";

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  const fetchProjectDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await projectService.getProjectById(projectId);
      if (!result.project) throw new Error("Project not found");

      let users = [];
      try {
        const usersResponse = await userProjectService.getProjectUsers(
          projectId
        );
        users = usersResponse.data || [];
        setProjectUsers(users);
      } catch (userError) {
        console.error("Error fetching project users:", userError);
      }

      let projectTasks = [];
      try {
        const tasksResponse = await taskService.getTasksByProject(projectId);
        projectTasks = tasksResponse.data || [];
      } catch (taskError) {
        console.error("Error fetching tasks:", taskError);
      }

      const projectManager = users.find((user) => user.role === 1) || null;

      setProject({
        ...result.project,
        project_manager: projectManager,
        users: users,
        tasks: projectTasks,
      });

      setTasks(projectTasks.length > 0 ? projectTasks.slice(0, 5) : []);
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("fetchError");
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [projectId, t, showToast]);

  useEffect(() => {
    if (projectId) fetchProjectDetails();
  }, [projectId, fetchProjectDetails]);

  const handleAddUsers = useCallback(
    () => navigate(`/projects/${projectId}/users`),
    [navigate, projectId]
  );
  const handleEditProject = useCallback(
    () => navigate(`/projects/${projectId}/edit`),
    [navigate, projectId]
  );
  const handleManageTasks = useCallback(
    () => navigate(`/projects/${projectId}/tasks`),
    [navigate, projectId]
  );
  const handleBackToProjects = useCallback(
    () => navigate("/projects"),
    [navigate]
  );
  const handleViewTask = useCallback(
    (taskId) => navigate(`/projects/${projectId}/tasks/${taskId}`),
    [navigate, projectId]
  );
  const handleEditTask = useCallback(
    (taskId) => navigate(`/projects/${projectId}/tasks/${taskId}/edit`),
    [navigate, projectId]
  );
  const toggleTaskExpand = useCallback(
    (taskId) => setExpandedTaskId(expandedTaskId === taskId ? null : taskId),
    [expandedTaskId]
  );

  const statistics = useMemo(() => {
    if (!project || !project.tasks)
      return {
        completedTasks: 0,
        inProgressTasks: 0,
        pendingTasks: 0,
        totalTasks: 0,
        teamMembers: 0,
        totalSubTasks: 0,
      };

    const completedTasks = project.tasks.filter(
      (task) => task.status === 2
    ).length;
    const inProgressTasks = project.tasks.filter(
      (task) => task.status === 1
    ).length;
    const pendingTasks = project.tasks.filter(
      (task) => task.status === 0
    ).length;
    const totalSubTasks = project.tasks.reduce(
      (total, task) => total + (task.subTasks ? task.subTasks.length : 0),
      0
    );

    return {
      completedTasks,
      inProgressTasks,
      pendingTasks,
      totalTasks: project.tasks.length,
      teamMembers: project?.users?.length || 0,
      totalSubTasks,
    };
  }, [project]);

  const projectManager = useMemo(() => {
    if (!project || !project.project_manager) return { name: "N/A", email: "" };
    return {
      name:
        project.project_manager.username ||
        project.project_manager.name ||
        "N/A",
      email: project.project_manager.email || "",
    };
  }, [project]);

  const timeProgress = useMemo(() => {
    if (!project || !project.start_date || !project.end_date) return 0;
    const start = new Date(project.start_date);
    const end = new Date(project.end_date);
    const now = new Date();
    if (now >= end) return 100;
    if (now <= start) return 0;
    const totalDuration = end - start;
    const elapsed = now - start;
    return Math.min(Math.round((elapsed / totalDuration) * 100), 100);
  }, [project]);

  const statusColors = {
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
  };

  const taskStatusColors = {
    planning: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    Underimplementation: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    Complete: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    Pause: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    Notimplemented: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };

  return (
    <DetailsLayout
      title={project?.name}
      subtitle={t("projectDetails")}
      id={project?.id}
      status={project?.status}
      statusColors={statusColors}
      statusTexts={
        project?.status ? { [project.status]: t(project.status) } : {}
      }
      loading={loading}
      error={error || (!project && !loading ? t("projectNotFound") : null)}
      onEdit={handleEditProject}
      onBack={handleBackToProjects}
      backLabel={t("backToProjects")}
      isRTL={isRTL}>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="totalTasks"
          value={statistics.totalTasks}
          subValue={`+${statistics.totalSubTasks} ${t("subTasks")}`}
          icon={ListTodo}
          color="blue"
          onClick={handleManageTasks}
        />
        <StatCard
          title="completed"
          value={statistics.completedTasks}
          subValue={`${
            statistics.totalTasks > 0
              ? Math.round(
                  (statistics.completedTasks / statistics.totalTasks) * 100
                )
              : 0
          }%`}
          icon={CheckCircle}
          color="green"
          onClick={handleManageTasks}
        />
        <StatCard
          title="inProgress"
          value={statistics.inProgressTasks}
          subValue={`${
            statistics.totalTasks > 0
              ? Math.round(
                  (statistics.inProgressTasks / statistics.totalTasks) * 100
                )
              : 0
          }%`}
          icon={Clock}
          color="yellow"
          onClick={handleManageTasks}
        />
        <StatCard
          title="teamMembers"
          value={statistics.teamMembers}
          subValue={`${projectUsers.filter((u) => u.role === 1).length} ${t(
            "admins"
          )}`}
          icon={Users}
          color="purple"
          onClick={handleAddUsers}
        />
      </div>
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="sm:col-span-2 space-y-6">
          <DetailsCard
            title={t("recentTasks")}
            icon={ListTodo}
            actionLabel={t("manageTasks")}
            onAction={handleManageTasks}
          >
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t("showing")} {Math.min(tasks.length, 5)} {t("of")}{" "}
              {statistics.totalTasks} {t("tasks")}
            </p>

            {tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all">
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              taskStatusColors[task.status] ||
                              taskStatusColors[0]
                            }`}>
                            {task.status === 0
                              ? t("pending")
                              : task.status === 1
                              ? t("inProgress")
                              : task.status === 2
                              ? t("completed")
                              : task.status === "paused"
                              ? t("paused")
                              : t("notImplemented")}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h3
                              className="font-medium text-gray-800 dark:text-white truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                              onClick={() => handleViewTask(task.id)}>
                              {task.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {task.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-end">
                            <div className="text-sm font-medium text-gray-800 dark:text-white">
                              {task.success_rate || 0}%
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {t("progress")}
                            </div>
                          </div>
                          <button
                            onClick={() => toggleTaskExpand(task.id)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                            {expandedTaskId === task.id ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex-1">
                          <ProgressBar
                            value={task.success_rate || 0}
                            height="h-2"
                            color="green"
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {new Date(task.start_date).toLocaleDateString()} -{" "}
                          {new Date(task.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {expandedTaskId === task.id && (
                      <div className="px-3 pb-3 border-t border-gray-200 dark:border-gray-600 pt-3">
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                         
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              {t("createdBy")}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {task.create_by || t("unknown")}
                            </p>
                          </div>
                          <div >
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              {t("adminNotes")}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {task.notesadmin || t("noNotes")}
                            </p>
                          </div>
                        </div>
                   
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ListTodo size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {t("noTasksInProject")}
                </p>
               
              </div>
            )}
          </DetailsCard>
        </div>

        <div className="space-y-6">
          <DetailsCard title={t("projectDetails")}>
            <div className="space-y-4">
              <DetailItem
                icon={Calendar}
                title={t("startDate")}
                value={
                  project?.start_date
                    ? new Date(project.start_date).toLocaleDateString()
                    : "N/A"
                }
              
                color="blue"
                isRTL={isRTL}
              />
              <DetailItem
                icon={Calendar}
                title={t("endDate")}
                value={
                  project?.end_date
                    ? new Date(project.end_date).toLocaleDateString()
                    : "N/A"
                }
               
                color="orange"
                isRTL={isRTL}
              />
              <DetailItem
                icon={User}
                title={t("projectManager")}
                value={project?.projectManagerName ? project.projectManagerName : "N/A"}
                subValue={""}
                color="green"
                isRTL={isRTL}
              />
            </div>
          </DetailsCard>

          {/* Project Progress */}
          <DetailsCard title={t("projectProgress")} icon={BarChart3}>
            <ProgressBar
              value={project?.success_rate || 0}
              subLabel={`${statistics.completedTasks}/${
                statistics.totalTasks
              } ${t("tasksCompleted")}`}
              label={t("completionRate")}
              animated
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              {t("basedOnTaskCompletion")}
            </div>
          </DetailsCard>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
          duration={5000}
          position="bottom-right"
        />
      )}
    </DetailsLayout>
  );
}
