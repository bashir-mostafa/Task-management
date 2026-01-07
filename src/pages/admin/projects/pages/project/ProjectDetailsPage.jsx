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
        completionPercentage: 0,
      };

    // احتساب التاسكات بناءً على الحالات الجديدة
    const completedTasks = project.tasks.filter(
      (task) => task.status === "Complete" || task.status === 2
    ).length;
    const inProgressTasks = project.tasks.filter(
      (task) => task.status === "Underimplementation" || task.status === 1
    ).length;
    const pausedTasks = project.tasks.filter(
      (task) => task.status === "Pause"
    ).length;
    const notImplementedTasks = project.tasks.filter(
      (task) => task.status === "Notimplemented"
    ).length;
    const totalSubTasks = project.tasks.reduce(
      (total, task) => total + (task.subTasks ? task.subTasks.length : 0),
      0
    );

    const totalTasks = project.tasks.length;
    
    // حساب نسبة الإكمال بناءً على التاسكات المكتملة فقط
    const completionPercentage = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;

    return {
      completedTasks,
      inProgressTasks,
      pausedTasks,
      notImplementedTasks,
      pendingTasks: totalTasks - (completedTasks + inProgressTasks + pausedTasks + notImplementedTasks),
      totalTasks,
      teamMembers: project?.users?.length || 0,
      totalSubTasks,
      completionPercentage,
    };
  }, [project]);

  // حساب نسبة إكمال المشروع بناءً على التاسكات المكتملة
  const projectCompletionRate = useMemo(() => {
    if (!project || !project.tasks || project.tasks.length === 0) {
      return 0;
    }
    
    // طريقة 1: استخدم percentage من statistics (أفضل)
    return statistics.completionPercentage;
    
    // طريقة 2: احسب مباشرة إذا كان success_rate غير موجود
    // const completedTasks = project.tasks.filter(
    //   task => task.status === "Complete" || task.status === 2
    // ).length;
    // return Math.round((completedTasks / project.tasks.length) * 100);
    
    // طريقة 3: استخدم project.success_rate إذا كان موجوداً وصحيحاً
    // if (project.success_rate !== undefined && project.success_rate !== null) {
    //   return project.success_rate;
    // }
    // return statistics.completionPercentage;
  }, [project, statistics.completionPercentage]);

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

  // Project status handling (للمشاريع)
  const getProjectStatusText = useCallback((status) => {
    if (!status) return "";
    
    const statusLower = status.toLowerCase().trim();
    
    const statusMap = {
      'planning': 'planning',
      'active': 'active',
      'completed': 'completed',
      'onhold': 'onHold',
      'cancelled': 'cancelled'
    };
    
    for (const [key, value] of Object.entries(statusMap)) {
      if (statusLower.includes(key.toLowerCase())) {
        return value;
      }
    }
    
    return status;
  }, []);

  // Task status handling (للتاسكات)
  const getTaskStatusText = useCallback((status) => {
    if (status === undefined || status === null) return "pending";
    
    // إذا كان الرقم (0, 1, 2)
    if (typeof status === "number") {
      const statusMap = {
        0: 'pending',
        1: 'Underimplementation',
        2: 'Complete'
      };
      return statusMap[status] || 'pending';
    }
    
    // إذا كان نصًا
    const statusString = String(status).trim();
    const statusLower = statusString.toLowerCase();
    
    const statusMap = {
      'underimplementation': 'Underimplementation',
      'complete': 'Complete',
      'notimplemented': 'Notimplemented',
      'pause': 'Pause',
      'pending': 'pending',
      'planning': 'planning'
    };
    
    for (const [key, value] of Object.entries(statusMap)) {
      if (statusLower.includes(key.toLowerCase())) {
        return value;
      }
    }
    
    return "pending";
  }, []);

  // Project status colors
  const projectStatusColors = {
    planning: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
    active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800",
    completed: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800",
    onHold: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800",
  };

  // Task status colors (للتاسكات)
  const taskStatusColors = {
    pending: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    planning: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    Underimplementation: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    Complete: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    Pause: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    Notimplemented: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };

  // Get project status for display
  const projectStatus = project ? getProjectStatusText(project.status) : 'planning';
  const projectStatusTexts = projectStatus ? { [projectStatus]: t(projectStatus) } : {};

  return (
    <DetailsLayout
      title={project?.name}
      subtitle={t("projectDetails")}
      id={project?.id}
      status={projectStatus}
      statusColors={projectStatusColors}
      statusTexts={projectStatusTexts}
      loading={loading}
      error={error || (!project && !loading ? t("projectNotFound") : null)}
      onEdit={handleEditProject}
      onBack={handleBackToProjects}
      backLabel={t("backToProjects")}
      isRTL={isRTL}
    >
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
                {tasks.map((task) => {
                  const taskStatus = getTaskStatusText(task.status);
                  const taskStatusKey = taskStatus; // الحفظ كمفتاح للترجمة
                  
                  return (
                    <div
                      key={task.id}
                      className="bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all"
                    >
                      <div className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                taskStatusColors[taskStatus] ||
                                taskStatusColors.pending
                              }`}
                            >
                              {t(taskStatusKey)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <h3
                                className="font-medium text-gray-800 dark:text-white truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                                onClick={() => handleViewTask(task.id)}
                              >
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
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            >
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
                              color={taskStatus === "Complete" ? "green" : 
                                     taskStatus === "Underimplementation" ? "yellow" :
                                     taskStatus === "Pause" ? "orange" :
                                     taskStatus === "Notimplemented" ? "red" : "blue"}
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
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t("adminNotes")}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {task.notesadmin || t("noNotes")}
                              </p>
                            </div>
                          </div>
                          
                          {/* Task Status Details */}
                          <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800/50 rounded">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {t("taskStatusDetails")}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs ${taskStatusColors[taskStatus]}`}>
                                {t(taskStatusKey)}
                              </span>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {taskStatus === "Underimplementation" ? t("inProgressDescription") :
                                 taskStatus === "Complete" ? t("completedDescription") :
                                 taskStatus === "Pause" ? t("pausedDescription") :
                                 taskStatus === "Notimplemented" ? t("notImplementedDescription") :
                                 t("pendingDescription")}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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

          {/* Project Progress - FIXED */}
          <DetailsCard title={t("projectProgress")} icon={BarChart3}>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("completionRate")}
                </span>
                <span className="text-sm font-bold text-gray-800 dark:text-white">
                  {projectCompletionRate}%
                </span>
              </div>
              <ProgressBar
                value={projectCompletionRate}
                subLabel={`${statistics.completedTasks}/${statistics.totalTasks} ${t("tasksCompleted")}`}
                animated
                showPercentage={true}
              />
            </div>
            
            {/* Time Progress */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("timeProgress")}
                </span>
                <span className="text-sm font-bold text-gray-800 dark:text-white">
                  {timeProgress}%
                </span>
              </div>
              <ProgressBar
                value={timeProgress}
                color={timeProgress >= 100 ? "red" : timeProgress >= 80 ? "yellow" : "blue"}
                animated
                showPercentage={true}
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>
                  {project?.start_date ? new Date(project.start_date).toLocaleDateString() : "N/A"}
                </span>
                <span>
                  {project?.end_date ? new Date(project.end_date).toLocaleDateString() : "N/A"}
                </span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              {t("basedOnTaskCompletion")}
            </div>
          </DetailsCard>

          {/* Task Status Summary */}
          <DetailsCard title={t("taskStatusSummary")} icon={BarChart3}>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t("completed")}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{statistics.completedTasks}</span>
                  <span className={`px-2 py-1 rounded text-xs ${taskStatusColors.Complete}`}>
                    {t("Complete")}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t("inProgress")}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{statistics.inProgressTasks}</span>
                  <span className={`px-2 py-1 rounded text-xs ${taskStatusColors.Underimplementation}`}>
                    {t("Underimplementation")}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t("paused")}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{statistics.pausedTasks}</span>
                  <span className={`px-2 py-1 rounded text-xs ${taskStatusColors.Pause}`}>
                    {t("Pause")}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t("notImplemented")}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{statistics.notImplementedTasks}</span>
                  <span className={`px-2 py-1 rounded text-xs ${taskStatusColors.Notimplemented}`}>
                    {t("Notimplemented")}
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("total")}
                  </span>
                  <span className="text-sm font-bold text-gray-800 dark:text-white">
                    {statistics.totalTasks} {t("tasks")}
                  </span>
                </div>
              </div>
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