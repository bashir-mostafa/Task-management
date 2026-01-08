// src/pages/admin/projects/pages/ProjectDetailsPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Plus,
  Calendar,
  User,
  Target,
  BarChart3,
  ListTodo,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Users,
  Pause,
  Play,
  Trash2,
} from "lucide-react";

import { projectService } from "../../../../admin/projects/services/projectService";
import { taskService } from "../../../../admin/projects/services/taskService";
import { userProjectService } from "../../../../admin/projects/services/userProjectService";

import DetailsLayout from "../../../../../components/Layout/DetailsLayout";
import DetailsCard from "../../../../../components/UI/DetailsCard";
import StatCard from "../../../../../components/UI/StatCard";
import ProgressBar from "../../../../../components/UI/ProgressBar";
import DetailItem from "../../../../../components/UI/DetailItem";
import ButtonHero from "../../../../../components/UI/ButtonHero";
import Toast from "../../../../../components/Toast";
import DeleteConfirmationModal from "../../../../../components/UI/DeleteConfirmationModal";

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
  const [isRTL] = useState(i18n.language === "ar");

  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Project status colors - حالات المشروع (5 حالات)
  const statusColors = {
    planning: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
    Underimplementation: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800",
    Complete: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800",
    Pause: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800",
    Notimplemented: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border border-gray-200 dark:border-gray-800",
  };

  // كائن statusIcons
  const statusIcons = {
    planning: <Clock size={16} className="text-blue-600 dark:text-blue-400" />,
    Underimplementation: <Play size={16} className="text-green-600 dark:text-green-400" />,
    Complete: <CheckCircle size={16} className="text-purple-600 dark:text-purple-400" />,
    Pause: <Pause size={16} className="text-orange-600 dark:text-orange-400" />,
    Notimplemented: <Clock size={16} className="text-gray-600 dark:text-gray-400" />,
  };

  // دالة للحصول على النص المترجم للحالة
  const getStatusText = useCallback((status) => {
    switch(status) {
      case 'planning':
        return t('planning');
      case 'Underimplementation':
        return t('underImplementation');
      case 'Complete':
        return t('complete');
      case 'Pause':
        return t('paused');
      case 'Notimplemented':
        return t('notImplemented');
      default:
        return t('planning');
    }
  }, [t]);

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
        const usersResponse = await userProjectService.getProjectUsers(projectId);
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
  const handleAddTask = useCallback(
    () => navigate(`/projects/${projectId}/tasks/create`),
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

  const handleDeleteProject = () => {
    setProjectToDelete(project);
    setDeleteModalOpen(true);
  };

  // دالة تنفيذ الإيقاف مباشرة
  const handlePauseProject = async () => {
    try {
      await projectService.pauseProject(projectId);
      showToast(t("projectPausedSuccessfully"), "success");
      fetchProjectDetails();
    } catch (error) {
      showToast(error.response?.data?.message || t("actionError"), "error");
    }
  };

  // دالة تنفيذ الاستئناف مباشرة
  const handleResumeProject = async () => {
    try {
      await projectService.resumeProject(projectId);
      showToast(t("projectResumedSuccessfully"), "success");
      fetchProjectDetails();
    } catch (error) {
      showToast(error.response?.data?.message || t("actionError"), "error");
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await projectService.deleteProject(projectId);
      showToast(t("projectDeletedSuccessfully"), "success");
      setTimeout(() => {
        navigate("/projects");
      }, 1500);
    } catch (error) {
      showToast(error.response?.data?.message || t("deleteError"), "error");
    } finally {
      setDeleteModalOpen(false);
      setProjectToDelete(null);
    }
  };

  const statistics = useMemo(() => {
    if (!project || !project.tasks)
      return {
        completedTasks: 0,
        inProgressTasks: 0,
        pausedTasks: 0,
        notImplementedTasks: 0,
        planningTasks: 0,
        totalTasks: 0,
        teamMembers: 0,
        totalSubTasks: 0,
        completionPercentage: 0,
      };

    // احتساب التاسكات بناءً على الحالات
    const completedTasks = project.tasks.filter(
      (task) => task.status === "Complete"
    ).length;
    const inProgressTasks = project.tasks.filter(
      (task) => task.status === "Underimplementation"
    ).length;
    const pausedTasks = project.tasks.filter(
      (task) => task.status === "Pause"
    ).length;
    const notImplementedTasks = project.tasks.filter(
      (task) => task.status === "Notimplemented"
    ).length;
    const planningTasks = project.tasks.filter(
      (task) => task.status === "planning"
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
      planningTasks,
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
    
    return statistics.completionPercentage;
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

  // Get project status
  const getProjectStatusText = useCallback((status) => {
    if (!status) return "planning";
    
    const statusString = String(status).trim();
    const statusLower = statusString.toLowerCase();
    
    const statusMap = {
      'planning': 'planning',
      'underimplementation': 'Underimplementation',
      'complete': 'Complete',
      'pause': 'Pause',
      'notimplemented': 'Notimplemented'
    };
    
    for (const [key, value] of Object.entries(statusMap)) {
      if (statusLower.includes(key.toLowerCase())) {
        return value;
      }
    }
    
    return "planning";
  }, []);

  // Get task status
  const getTaskStatusText = useCallback((status) => {
    if (status === undefined || status === null) return "planning";
    
    const statusString = String(status).trim();
    const statusLower = statusString.toLowerCase();
    
    const statusMap = {
      'underimplementation': 'Underimplementation',
      'complete': 'Complete',
      'pause': 'Pause',
      'notimplemented': 'Notimplemented'
    };
    
    for (const [key, value] of Object.entries(statusMap)) {
      if (statusLower.includes(key.toLowerCase())) {
        return value;
      }
    }
    
    return "planning";
  }, []);

  // Task status colors (4 حالات فقط للتاسكات)
  const taskStatusColors = {
    Underimplementation: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    Complete: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    Pause: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    Notimplemented: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };

  // Get current project status
  const projectStatus = project ? getProjectStatusText(project.status) : 'planning';
  
  // Function to check if project can be paused
  const canPauseProject = useMemo(() => {
    return projectStatus === "Underimplementation" || projectStatus === "planning";
  }, [projectStatus]);

  // Function to check if project can be resumed
  const canResumeProject = useMemo(() => {
    return projectStatus === "Pause";
  }, [projectStatus]);

  // الحصول على النص المترجم لحالة المشروع
  const translatedProjectStatus = getStatusText(projectStatus);

  return (
    <DetailsLayout
      title={project?.name}
      subtitle={t("projectDetails")}
      id={project?.id}
      statusColors={statusColors}
      statusIcons={statusIcons}
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
          title={t("totalTasks")}
          value={statistics.totalTasks}
          subValue={`+${statistics.totalSubTasks} ${t("subTasks")}`}
          icon={ListTodo}
          color="blue"
          onClick={handleManageTasks}
        />
        <StatCard
          title={t("completed")}
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
          title={t("inProgress")}
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
          title={t("teamMembers")}
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
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Description Card */}
          <DetailsCard 
            title={t("projectDescription")} 
            icon={FileText}
          >
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {project?.description || t("noDescription")}
              </p>
            </div>
          </DetailsCard>

          {/* Recent Tasks Card */}
          <DetailsCard
            title={t("recentTasks")}
            icon={ListTodo}
            actions={
              <div className="flex gap-2">
                <ButtonHero
                  onClick={handleManageTasks}
                  variant="info"
                  size="sm"
                  isRTL={isRTL}
                  icon={ListTodo}
                  iconPosition={isRTL ? "right" : "left"}
                  className="flex items-center gap-2"
                >
                  {t("manageTasks")}
                </ButtonHero>
                <ButtonHero
                  onClick={handleAddTask}
                  variant="success"
                  size="sm"
                  isRTL={isRTL}
                  icon={Plus}
                  iconPosition={isRTL ? "right" : "left"}
                  className="flex items-center gap-2"
                >
                  {t("addTask")}
                </ButtonHero>
              </div>
            }
          >
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t("showing")} {Math.min(tasks.length, 5)} {t("of")}{" "}
              {statistics.totalTasks} {t("tasks")}
            </p>

            {tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map((task) => {
                  const taskStatus = getTaskStatusText(task.status);
                  const translatedTaskStatus = getStatusText(taskStatus);
                  
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
                                taskStatusColors.Underimplementation
                              }`}
                            >
                              {translatedTaskStatus}
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
                <ButtonHero
                  onClick={handleAddTask}
                  variant="success"
                  size="md"
                  isRTL={isRTL}
                  icon={Plus}
                  iconPosition={isRTL ? "right" : "left"}
                  className="flex items-center gap-2 mx-auto"
                >
                  {t("addFirstTask")}
                </ButtonHero>
              </div>
            )}
          </DetailsCard>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Project Information Card */}
          <DetailsCard 
            title={t("projectInformation")} 
            icon={FileText}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("projectID")}:
                </span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  #{project?.id}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("status")}:
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
                  statusColors[projectStatus] || statusColors.planning
                }`}>
                  {statusIcons[projectStatus] || statusIcons.planning}
                  {translatedProjectStatus}
                </span>
              </div>

              <DetailItem
                icon={Calendar}
                title={t("startDate")}
                value={
                  project?.start_date
                    ? new Date(project.start_date).toLocaleDateString()
                    : t("notSet")
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
                    : t("notSet")
                }
                color="orange"
                isRTL={isRTL}
              />
              
              <DetailItem
                icon={User}
                title={t("projectManager")}
                value={project?.projectManagerName}
                
                color="green"
                isRTL={isRTL}
              />
            </div>
          </DetailsCard>

          {/* Quick Actions Card */}
          <DetailsCard 
            title={t("quickActions")} 
            icon={Target}
          >
            <div className="space-y-2">
              <ButtonHero
                onClick={handleAddUsers}
                variant="primary"
                size="md"
                isRTL={isRTL}
                icon={Users}
                iconPosition={isRTL ? "right" : "left"}
                fullWidth={true}
                className="justify-start"
              >
                {t("manageUsers")} ({projectUsers.length})
              </ButtonHero>

              <ButtonHero
                onClick={handleAddTask}
                variant="success"
                size="md"
                isRTL={isRTL}
                icon={Plus}
                iconPosition={isRTL ? "right" : "left"}
                fullWidth={true}
                className="justify-start"
              >
                {t("addTask")}
              </ButtonHero>

              {/* زر إيقاف المشروع - يظهر فقط إذا كان المشروع قابلاً للإيقاف */}
              {canPauseProject && (
                <ButtonHero
                  onClick={handlePauseProject}
                  variant="warning"
                  size="md"
                  isRTL={isRTL}
                  icon={Pause}
                  iconPosition={isRTL ? "right" : "left"}
                  fullWidth={true}
                  className="justify-start"
                >
                  {t("pauseProject")}
                </ButtonHero>
              )}

              {/* زر استئناف المشروع - يظهر فقط إذا كان المشروع متوقفاً */}
              {canResumeProject && (
                <ButtonHero
                  onClick={handleResumeProject}
                  variant="success"
                  size="md"
                  isRTL={isRTL}
                  icon={Play}
                  iconPosition={isRTL ? "right" : "left"}
                  fullWidth={true}
                  className="justify-start"
                >
                  {t("resumeProject")}
                </ButtonHero>
              )}

              {/* زر حذف المشروع */}
              <ButtonHero
                onClick={handleDeleteProject}
                variant="danger"
                size="md"
                isRTL={isRTL}
                icon={Trash2}
                iconPosition={isRTL ? "right" : "left"}
                fullWidth={true}
                className="justify-start"
              >
                {t("deleteProject")}
              </ButtonHero>
            </div>
          </DetailsCard>

          {/* Project Progress Card */}
          <DetailsCard 
            title={t("projectProgress")} 
            icon={BarChart3}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("completionRate")}
                  </span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {projectCompletionRate}%
                  </span>
                </div>
                <ProgressBar
                  value={projectCompletionRate}
                  height="h-3"
                  color="primary"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {t("basedOnTaskCompletion")}
                </div>
              </div>

              {/* Time Progress */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t("timeProgress")}
                    </span>
                    <span className="text-sm font-bold text-gray-800 dark:text-white">
                      {timeProgress}%
                    </span>
                  </div>
                  <ProgressBar
                    value={timeProgress}
                    color={timeProgress >= 100 ? "red" : timeProgress >= 80 ? "yellow" : "blue"}
                    height="h-3"
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
              </div>

              {/* Task Status Summary */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">
                    {statistics.completedTasks}
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                    {t("completed")}
                  </div>
                </div>
                <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                    {statistics.inProgressTasks}
                  </div>
                  <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    {t("inProgress")}
                  </div>
                </div>
              </div>
            </div>
          </DetailsCard>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={projectToDelete?.name}
        type="project"
        count={1}
      />

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
          duration={5000}
        />
      )}
    </DetailsLayout>
  );
}