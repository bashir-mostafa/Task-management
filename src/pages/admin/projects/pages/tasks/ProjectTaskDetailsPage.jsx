import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  User,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  ChevronRight,
  UserCheck,
  Target,
  BarChart3,
  Pause,
  Play,
  Pencil,
  Users,
  Star,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  List,
  Building,
  FolderTree,
  GitBranch,
  Layers,
  Activity,
  ExternalLink,
  UsersIcon,
  Settings,
  EyeIcon,
  FilePlus,
  Calculator
} from "lucide-react";
import { taskService } from "../../services/taskService";
import { supTaskService } from "../../services/supTaskService";
import { userService } from "../../../users/services/userService";
import { projectService } from "../../../projects/services/projectService";

import DetailsLayout from "../../../../../components/Layout/DetailsLayout";
import DetailsCard from "../../../../../components/UI/DetailsCard";
import StatCard from "../../../../../components/UI/StatCard";
import ProgressBar from "../../../../../components/UI/ProgressBar";
import DetailItem from "../../../../../components/UI/DetailItem";
import ButtonHero from "../../../../../components/UI/ButtonHero";
import Toast from "../../../../../components/Toast";
import Modal from "../../../../../components/UI/Modal";
import DeleteConfirmationModal from "../../../../../components/UI/DeleteConfirmationModal";

export default function ProjectTaskDetailsPage() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [subTasks, setSubTasks] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProject, setLoadingProject] = useState(false);
  const [loadingSubTasks, setLoadingSubTasks] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState("");
  const [isRTL] = useState(i18n.language === "ar");

  // Modal states
  const [pauseResumeModalOpen, setPauseResumeModalOpen] = useState(false);
  const [pauseResumeAction, setPauseResumeAction] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // إحصائيات المهام الفرعية
  const [subTaskStats, setSubTaskStats] = useState({
    total: 0,
    statusCounts: []
  });

  // معدل الإنجاز المحسوب ديناميكياً
  const [calculatedSuccessRate, setCalculatedSuccessRate] = useState(0);

  const statusColors = {
    Notimplemented:
      "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border border-gray-200 dark:border-gray-800",
    Underimplementation:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
    Complete:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800",
    Pause:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800",
  };

  const statusIcons = {
    Notimplemented: (
      <Clock size={16} className="text-gray-600 dark:text-gray-400" />
    ),
    Underimplementation: (
      <AlertCircle size={16} className="text-blue-600 dark:text-blue-400" />
    ),
    Complete: (
      <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
    ),
    Pause: <Pause size={16} className="text-orange-600 dark:text-orange-400" />,
  };

  // ألوان الحالات للمهام الفرعية
  const subTaskStatusColors = {
    Notimplemented: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
    Underimplementation: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    Complete: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    Pause: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  };

  // أيقونات الحالات للمهام الفرعية
  const subTaskStatusIcons = {
    Notimplemented: <Clock size={16} className="text-gray-500" />,
    Underimplementation: <AlertCircle size={16} className="text-blue-500" />,
    Complete: <CheckCircle size={16} className="text-green-500" />,
    Pause: <Pause size={16} className="text-orange-500" />,
  };

  const getStatusText = (statusString) => {
    const statusMap = {
      Notimplemented: "notImplemented",
      Underimplementation: "underImplementation",
      Complete: "completed",
      Pause: "paused",
    };
    return statusMap[statusString] || "notImplemented";
  };

  // دالة للحصول على نص حالة المهمة الفرعية
  const getSubTaskStatusText = (status) => {
    const statusMap = {
      Notimplemented: "notImplemented",
      Underimplementation: "underImplementation",
      Complete: "completed",
      Pause: "paused",
    };
    return statusMap[status] || "unknown";
  };

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  // دالة لحساب معدل الإنجاز بناءً على المهام الفرعية المكتملة
  const calculateSuccessRate = useCallback((tasksArray) => {
    if (!tasksArray || tasksArray.length === 0) return 0;
    
    const completedTasks = tasksArray.filter(st => st.status === "Complete").length;
    const totalTasks = tasksArray.length;
    
    return Math.round((completedTasks / totalTasks) * 100);
  }, []);

  // دالة لتحديث معدل الإنجاز عند تغيير المهام الفرعية
  useEffect(() => {
    if (subTasks.length > 0) {
      const successRate = calculateSuccessRate(subTasks);
      setCalculatedSuccessRate(successRate);
    } else {
      setCalculatedSuccessRate(0);
    }
  }, [subTasks, calculateSuccessRate]);

  useEffect(() => {
    fetchTaskDetails();
    fetchProjectDetails();
  }, [projectId, taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTaskById(taskId);
      if (response) {
        setTask(response);
        fetchSubTasks();
        fetchAssignedUsers();
      } else {
        setError(t("taskNotFound"));
        showToast(t("taskNotFound"), "error");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("fetchError");
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectDetails = async () => {
    try {
      setLoadingProject(true);
      const response = await projectService.getProjectById(projectId);
      if (response && response.project) {
        setProject(response.project);
      } else {
        setProject({
          id: projectId,
          name: `Project #${projectId}`,
          description: "Project details not available",
        });
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
      setProject({
        id: projectId,
        name: `Project #${projectId}`,
        description: "Could not load project details",
      });
    } finally {
      setLoadingProject(false);
    }
  };

  const fetchSubTasks = async () => {
    try {
      setLoadingSubTasks(true);
      const response = await supTaskService.getSupTasksByTask(taskId, 1, 20);
      
      // استخراج البيانات من الاستجابة
      const subTasksData = response?.data || [];
      const totalCount = response?.totalCount || 0;
      const statusCounts = response?.statusCounts || [];
      
      setSubTasks(subTasksData);
      
      // حفظ إحصائيات إضافية
      setSubTaskStats({
        total: totalCount,
        statusCounts: statusCounts
      });
      
      // حساب معدل الإنجاز الجديد
      const successRate = calculateSuccessRate(subTasksData);
      setCalculatedSuccessRate(successRate);
      
    } catch (error) {
      console.error("Error fetching sub-tasks:", error);
      showToast(t("fetchSubTasksError"), "error");
    } finally {
      setLoadingSubTasks(false);
    }
  };

  const fetchAssignedUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await userService.getUsers();
      setAssignedUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching assigned users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // إحصائيات المهام الفرعية
  const getSubTaskStats = () => {
    const total = subTasks.length;
    const completed = subTasks.filter(st => st.status === "Complete").length;
    const inProgress = subTasks.filter(st => st.status === "Underimplementation").length;
    const pending = subTasks.filter(st => st.status === "Notimplemented" || !st.status).length;
    const paused = subTasks.filter(st => st.status === "Pause").length;
    
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      total,
      completed,
      inProgress,
      pending,
      paused,
      completionRate
    };
  };

  const subTaskStatsData = getSubTaskStats();

  const handleAddSubTask = () => {
    navigate(`/projects/${projectId}/tasks/${taskId}/subtasks/create`);
  };

  const handleViewSubTasksList = () => {
    navigate(`/projects/${projectId}/tasks/${taskId}/subtasks`);
  };

  const handleEditTask = () => {
    navigate(`/projects/${projectId}/tasks/${taskId}/edit`);
  };

  const handleDeleteTask = () => {
    setTaskToDelete(task);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await taskService.deleteTask(taskId);
      showToast(t("taskDeletedSuccessfully"), "success");
      setTimeout(() => {
        navigate(`/projects/${projectId}/tasks`);
      }, 1500);
    } catch (error) {
      showToast(error.response?.data?.message || t("deleteError"), "error");
    } finally {
      setDeleteModalOpen(false);
      setTaskToDelete(null);
    }
  };

  const handleAssignUsers = () => {
    navigate(`/projects/${projectId}/tasks/${taskId}/assign-users`);
  };

  const handlePauseTask = async () => {
    try {
      await taskService.pauseTask(taskId);
      showToast(t("taskPausedSuccessfully"), "success");
      fetchTaskDetails();
    } catch (error) {
      showToast(error.response?.data?.message || t("actionError"), "error");
    }
  };

  const handleResumeTask = async () => {
    try {
      await taskService.resumeTask(taskId);
      showToast(t("taskResumedSuccessfully"), "success");
      fetchTaskDetails();
    } catch (error) {
      showToast(error.response?.data?.message || t("actionError"), "error");
    }
  };

  const handleViewSubTask = (subTaskId) => {
    navigate(`/projects/${projectId}/tasks/${taskId}/subtasks/${subTaskId}`);
  };

  const handleBack = () => {
    navigate(`/projects/${projectId}/tasks`);
  };

  // دالة لتحديث معدل الإنجاز في الخادم (اختياري)
  const updateTaskSuccessRateInServer = async (successRate) => {
    try {
      await taskService.updateTaskSuccessRate(taskId, successRate);
    } catch (error) {
      console.error("Error updating success rate:", error);
    }
  };

  const statusText = task?.status ? t(getStatusText(task.status)) : "";

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          className={
            i <= rating
              ? "text-yellow-500 fill-yellow-500"
              : "text-gray-300 dark:text-gray-600"
          }
        />
      );
    }
    return stars;
  };

  return (
    <DetailsLayout
      title={task?.name}
      subtitle={t("taskDetails")}
      id={task?.id}
      status={task?.status}
      statusColors={statusColors}
      statusIcons={statusIcons}
      statusTexts={task?.status ? { [task.status]: statusText } : {}}
      loading={loading}
      error={error || (!task && !loading ? t("taskNotFound") : null)}
      onEdit={handleEditTask}
      onBack={handleBack}
      backLabel={t("backToTasks")}
      isRTL={isRTL}>
      
      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Description Card */}
          <DetailsCard 
            title={t("taskDescription")} 
            icon={FileText}
          >
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {task?.description || t("noDescription")}
              </p>
            </div>
            {task?.notes_admin && (
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2 flex items-center gap-2">
                  <AlertCircle size={16} />
                  {t("adminNotes")}
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  {task.notes_admin}
                </p>
              </div>
            )}
          </DetailsCard>

          {/* SubTasks Overview Card */}
          <DetailsCard
            title={t("subTasksOverview")}
            icon={GitBranch}
            actions={
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg">
                  <Activity size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    {subTaskStatsData.completionRate}% {t("completed")}
                  </span>
                </div>
                <div className="flex gap-2">
                  <ButtonHero
                    onClick={handleViewSubTasksList}
                    variant="info"
                    size="sm"
                    isRTL={isRTL}
                    icon={Layers}
                    iconPosition={isRTL ? "right" : "left"}
                    className="flex items-center gap-2"
                  >
                    {t("viewSubTasksList")}
                  </ButtonHero>
                </div>
              </div>
            }>
            
            {/* SubTask Statistics */}
            <div className="grid grid-cols-5 gap-3 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center border border-blue-200 dark:border-blue-700/30">
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{subTaskStatsData.total}</div>
                <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">{t("total")}</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center border border-green-200 dark:border-green-700/30">
                <div className="text-xl font-bold text-green-600 dark:text-green-400">{subTaskStatsData.completed}</div>
                <div className="text-xs text-green-700 dark:text-green-300 mt-1">{t("completed")}</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center border border-yellow-200 dark:border-yellow-700/30">
                <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{subTaskStatsData.inProgress}</div>
                <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">{t("inProgress")}</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg text-center border border-orange-200 dark:border-orange-700/30">
                <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{subTaskStatsData.paused}</div>
                <div className="text-xs text-orange-700 dark:text-orange-300 mt-1">{t("paused")}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg text-center border border-gray-200 dark:border-gray-700/30">
                <div className="text-xl font-bold text-gray-600 dark:text-gray-400">{subTaskStatsData.pending}</div>
                <div className="text-xs text-gray-700 dark:text-gray-300 mt-1">{t("pending")}</div>
              </div>
            </div>

          

            {/* Recent SubTasks */}
            {loadingSubTasks ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : subTasks.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t("recentSubTasks")}</h4>
                {subTasks.slice(0, 5).map((subTask) => (
                  <div
                    key={subTask.id}
                    className="group bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-200 cursor-pointer"
                    onClick={() => handleViewSubTask(subTask.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${subTaskStatusColors[subTask.status] || 'bg-gray-100 dark:bg-gray-800'}`}>
                          {subTaskStatusIcons[subTask.status] || <AlertCircle size={16} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {subTask.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {subTask.description || t("noDescription")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${subTaskStatusColors[subTask.status] || 'bg-gray-100'}`}>
                          {t(getSubTaskStatusText(subTask.status))}
                        </span>
                        <ChevronRight size={16} className="text-gray-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
                      </div>
                    </div>
                    
                    {/* معلومات المستخدم المعين */}
                    {subTask.user && (
                      <div className="flex items-center gap-2 mt-3 text-sm">
                        <User size={12} className="text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {subTask.user.username} ({subTask.user.role})
                        </span>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {subTask.start_date
                            ? new Date(subTask.start_date).toLocaleDateString()
                            : t("notSet")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {subTask.end_date
                            ? new Date(subTask.end_date).toLocaleDateString()
                            : t("notSet")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {subTasks.length > 5 && (
                  <div className="text-center pt-4">
                    <ButtonHero
                      onClick={handleViewSubTasksList}
                      variant="primary"
                      size="md"
                      isRTL={isRTL}
                      icon={ExternalLink}
                      iconPosition={isRTL ? "right" : "left"}
                      className="flex items-center gap-2 mx-auto"
                    >
                      {t("viewAllSubTasks")} ({subTasks.length})
                    </ButtonHero>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GitBranch size={24} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  {t("noSubTasksYet")}
                </h4>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  {t("noSubTasksDescription")}
                </p>
                <div className="flex gap-3 justify-center">
                  <ButtonHero
                    onClick={handleAddSubTask}
                    variant="success"
                    size="md"
                    isRTL={isRTL}
                    icon={FilePlus}
                    iconPosition={isRTL ? "right" : "left"}
                    className="flex items-center gap-2"
                  >
                    {t("createFirstSubTask")}
                  </ButtonHero>
                  <ButtonHero
                    onClick={handleViewSubTasksList}
                    variant="outline"
                    size="md"
                    isRTL={isRTL}
                    icon={EyeIcon}
                    iconPosition={isRTL ? "right" : "left"}
                    className="flex items-center gap-2"
                  >
                    {t("viewList")}
                  </ButtonHero>
                </div>
              </div>
            )}
          </DetailsCard>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Task Information Card */}
          <DetailsCard 
            title={t("taskInformation")} 
            icon={FileText}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("taskID")}:
                </span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  #{task?.id}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("project")}:
                </span>
                <div className="flex items-center gap-2">
                  {loadingProject ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  ) : (
                    <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                      <Building size={14} />
                      {project?.name || `Project #${projectId}`}
                    </span>
                  )}
                </div>
              </div>

              <DetailItem
                icon={Calendar}
                title={t("startDate")}
                value={
                  task?.start_date
                    ? new Date(task.start_date).toLocaleDateString()
                    : t("notSet")
                }
                color="blue"
                isRTL={isRTL}
              />
              <DetailItem
                icon={Calendar}
                title={t("endDate")}
                value={
                  task?.end_date
                    ? new Date(task.end_date).toLocaleDateString()
                    : t("notSet")
                }
                color="orange"
                isRTL={isRTL}
              />
             
              <DetailItem
                icon={BarChart3}
                title={t("evaluation")}
                value={
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {renderStars(Math.floor(task?.evaluation_admin || 0))}
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ({task?.evaluation_admin || 0}/5)
                    </span>
                  </div>
                }
                color="purple"
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
                onClick={handleAssignUsers}
                variant="primary"
                size="md"
                isRTL={isRTL}
                icon={UserPlus}
                iconPosition={isRTL ? "right" : "left"}
                fullWidth={true}
                className="justify-start"
              >
                {t("assignUsers")} ({assignedUsers.length})
              </ButtonHero>

              {/* Add SubTask - لون النجاح */}
              <ButtonHero
                onClick={handleAddSubTask}
                variant="success"
                size="md"
                isRTL={isRTL}
                icon={Plus}
                iconPosition={isRTL ? "right" : "left"}
                fullWidth={true}
                className="justify-start"
              >
                {t("addSubTask")}
              </ButtonHero>

              {/* Pause Task - لون التحذير */}
              {task?.status === "Underimplementation" && (
                <ButtonHero
                  onClick={handlePauseTask}
                  variant="warning"
                  size="md"
                  isRTL={isRTL}
                  icon={Pause}
                  iconPosition={isRTL ? "right" : "left"}
                  fullWidth={true}
                  className="justify-start"
                >
                  {t("pauseTask")}
                </ButtonHero>
              )}

              {/* Resume Task - لون الاستئناف */}
              {task?.status === "Pause" && (
                <ButtonHero
                  onClick={handleResumeTask}
                  variant="success"
                  size="md"
                  isRTL={isRTL}
                  icon={Play}
                  iconPosition={isRTL ? "right" : "left"}
                  fullWidth={true}
                  className="justify-start"
                >
                  {t("resumeTask")}
                </ButtonHero>
              )}

              {/* Delete Task - لون الخطر */}
              <ButtonHero
                onClick={handleDeleteTask}
                variant="danger"
                size="md"
                isRTL={isRTL}
                icon={Trash2}
                iconPosition={isRTL ? "right" : "left"}
                fullWidth={true}
                className="justify-start"
              >
                {t("deleteTask")}
              </ButtonHero>
            </div>
          </DetailsCard>

          {/* Task Statistics Card */}
          <DetailsCard 
            title={t("taskStatistics")} 
            icon={BarChart3}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("completionRate")}
                  </span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {/* استخدام معدل الإنجاز المحسوب ديناميكياً */}
                    {calculatedSuccessRate}%
                  </span>
                </div>
                <ProgressBar
                  value={calculatedSuccessRate}
                  height="h-3"
                  color="primary"
                />
                
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {subTasks.length}
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    {t("totalSubTasks")}
                  </div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">
                    {subTaskStatsData.completed}
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                    {t("completedSubTasks")}
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
          setTaskToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={taskToDelete?.name}
        type="task"
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