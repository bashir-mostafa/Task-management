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
  Activity
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
import Button from "../../../../../components/UI/Button";
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

  const getStatusText = (statusString) => {
    const statusMap = {
      Notimplemented: "notImplemented",
      Underimplementation: "underImplementation",
      Complete: "completed",
      Pause: "paused",
    };
    return statusMap[statusString] || "notImplemented";
  };

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

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
      const response = await supTaskService.getSupTasksByTask(taskId);
      setSubTasks(response.data || []);
    } catch (error) {
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

  const handlePauseTask = () => {
    setPauseResumeAction("pause");
    setPauseResumeModalOpen(true);
  };

  const handleResumeTask = () => {
    setPauseResumeAction("resume");
    setPauseResumeModalOpen(true);
  };

  const handleConfirmPauseResume = async () => {
    try {
      if (pauseResumeAction === "pause") {
        await taskService.pauseTask(taskId);
        showToast(t("taskPausedSuccessfully"), "success");
      } else {
        await taskService.resumeTask(taskId);
        showToast(t("taskResumedSuccessfully"), "success");
      }
      setPauseResumeModalOpen(false);
      setPauseResumeAction("");
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

  // إحصائيات المهمات الفرعية
  const getSubTaskStats = () => {
    const total = subTasks.length;
    const completed = subTasks.filter((st) => st.status === 2).length;
    const inProgress = subTasks.filter((st) => st.status === 1).length;
    const pending = subTasks.filter((st) => st.status === 0).length;
    
    return {
      total,
      completed,
      inProgress,
      pending,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  const subTaskStats = getSubTaskStats();

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
            className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/10"
          >
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {task?.description || t("noDescription")}
              </p>
            </div>
            {task?.notes_admin && (
              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
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
            className="bg-gradient-to-br from-white to-emerald-50 dark:from-gray-800 dark:to-emerald-900/10"
            actions={
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg">
                  <Activity size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    {subTaskStats.completionRate}% {t("completed")}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleViewSubTasksList}
                    variant="secondary"
                    size="sm"
                    className={`flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 hover:from-gray-200 hover:to-gray-100 dark:hover:from-gray-600 dark:hover:to-gray-700 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}>
                    <Layers size={14} />
                    {t("viewSubTasksList")}
                  </Button>
                  <Button
                    onClick={handleAddSubTask}
                    variant="secondary"
                    size="sm"
                    className={`flex items-center gap-2 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-800/20 hover:from-blue-200 hover:to-blue-100 dark:hover:from-blue-800 dark:hover:to-blue-700 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}>
                    <Plus size={14} />
                    {t("addSubTask")}
                  </Button>
                </div>
              </div>
            }>
            
            {/* SubTask Statistics */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl text-center border border-blue-200 dark:border-blue-700/30">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{subTaskStats.total}</div>
                <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">{t("total")}</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl text-center border border-green-200 dark:border-green-700/30">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{subTaskStats.completed}</div>
                <div className="text-sm text-green-700 dark:text-green-300 mt-1">{t("completed")}</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 rounded-xl text-center border border-yellow-200 dark:border-yellow-700/30">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{subTaskStats.inProgress}</div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">{t("inProgress")}</div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 p-4 rounded-xl text-center border border-gray-200 dark:border-gray-700/30">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{subTaskStats.pending}</div>
                <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">{t("pending")}</div>
              </div>
            </div>

            {/* Recent SubTasks */}
            {loadingSubTasks ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  {t("loading")}
                </p>
              </div>
            ) : subTasks.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t("recentSubTasks")}</h4>
                {subTasks.slice(0, 5).map((subTask) => (
                  <div
                    key={subTask.id}
                    className="group bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300 cursor-pointer hover:shadow-md"
                    onClick={() => handleViewSubTask(subTask.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${
                          subTask.status === 2 ? 'bg-green-100 dark:bg-green-900/30' :
                          subTask.status === 1 ? 'bg-blue-100 dark:bg-blue-900/30' :
                          'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          {subTask.status === 2 ? 
                            <CheckCircle size={16} className="text-green-600 dark:text-green-400" /> :
                            subTask.status === 1 ? 
                            <Clock size={16} className="text-blue-600 dark:text-blue-400" /> :
                            <AlertCircle size={16} className="text-gray-500 dark:text-gray-400" />
                          }
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
                      <ChevronRight size={16} className="text-gray-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {subTask.start_date
                            ? new Date(subTask.start_date).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {subTask.end_date
                            ? new Date(subTask.end_date).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {subTasks.length > 5 && (
                  <div className="text-center pt-4">
                    <Button
                      onClick={handleViewSubTasksList}
                      variant="outline"
                      className={`flex items-center gap-2 mx-auto bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 hover:from-emerald-100 hover:to-green-100 dark:hover:from-emerald-800 dark:hover:to-green-800 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}>
                      <Layers size={14} />
                      {t("viewAllSubTasks")} ({subTasks.length})
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GitBranch size={24} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  {t("noSubTasksYet")}
                </h4>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  {t("noSubTasksDescription")}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={handleAddSubTask}
                    className={`flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}>
                    <Plus size={16} />
                    <span>{t("createFirstSubTask")}</span>
                  </Button>
                  <Button
                    onClick={handleViewSubTasksList}
                    variant="outline"
                    className={`flex items-center gap-2 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}>
                    <List size={16} />
                    <span>{t("viewList")}</span>
                  </Button>
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
            className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/10"
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
            className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/10"
          >
            <div className="space-y-2">
              {/* View SubTasks List */}
              <Button
                onClick={handleViewSubTasksList}
                variant="secondary"
                className={`w-full justify-start h-12 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 hover:from-emerald-100 hover:to-green-100 dark:hover:from-emerald-800 dark:hover:to-green-800 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <Layers size={16} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{t("viewSubTasksList")}</div>
                    <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                      {subTasks.length} {t("subTasks")}
                    </div>
                  </div>
                </div>
              </Button>

              {/* Edit Task */}
              <Button
                onClick={handleEditTask}
                variant="secondary"
                className={`w-full justify-start h-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800 dark:hover:to-indigo-800 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Pencil size={16} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{t("editTask")}</div>
                    <div className="text-xs text-blue-600/70 dark:text-blue-400/70">
                      {t("modifyDetails")}
                    </div>
                  </div>
                </div>
              </Button>

              {/* Assign Users */}
              <Button
                onClick={handleAssignUsers}
                variant="secondary"
                className={`w-full justify-start h-12 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/10 dark:to-violet-900/10 hover:from-purple-100 hover:to-violet-100 dark:hover:from-purple-800 dark:hover:to-violet-800 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <UserCheck size={16} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{t("assignUsers")}</div>
                    <div className="text-xs text-purple-600/70 dark:text-purple-400/70">
                      {assignedUsers.length} {t("assigned")}
                    </div>
                  </div>
                </div>
              </Button>

              {/* Add SubTask */}
              <Button
                onClick={handleAddSubTask}
                variant="secondary"
                className={`w-full justify-start h-12 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-800 dark:hover:to-teal-800 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <Plus size={16} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{t("addSubTask")}</div>
                    <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                      {t("createNew")}
                    </div>
                  </div>
                </div>
              </Button>

              {/* Pause Task Button */}
              {task?.status === "Underimplementation" && (
                <Button
                  onClick={handlePauseTask}
                  variant="warning"
                  className={`w-full justify-start h-12 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 hover:from-orange-100 hover:to-amber-100 dark:hover:from-orange-800 dark:hover:to-amber-800 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <Pause size={16} className="text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{t("pauseTask")}</div>
                      <div className="text-xs text-orange-600/70 dark:text-orange-400/70">
                        {t("temporaryStop")}
                      </div>
                    </div>
                  </div>
                </Button>
              )}

              {/* Resume Task Button */}
              {task?.status === "Pause" && (
                <Button
                  onClick={handleResumeTask}
                  variant="success"
                  className={`w-full justify-start h-12 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 hover:from-emerald-100 hover:to-green-100 dark:hover:from-emerald-800 dark:hover:to-green-800 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                      <Play size={16} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{t("resumeTask")}</div>
                      <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                        {t("continueWork")}
                      </div>
                    </div>
                  </div>
                </Button>
              )}

              {/* Delete Task */}
              <Button
                onClick={handleDeleteTask}
                variant="danger"
                className={`w-full justify-start h-12 bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-900/10 dark:to-red-900/10 hover:from-rose-100 hover:to-red-100 dark:hover:from-rose-800 dark:hover:to-red-800 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                    <Trash2 size={16} className="text-rose-600 dark:text-rose-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{t("deleteTask")}</div>
                    <div className="text-xs text-rose-600/70 dark:text-rose-400/70">
                      {t("permanentAction")}
                    </div>
                  </div>
                </div>
              </Button>
            </div>
          </DetailsCard>

          {/* Task Statistics Card */}
          <DetailsCard 
            title={t("taskStatistics")} 
            icon={BarChart3}
            className="bg-gradient-to-br from-white to-cyan-50 dark:from-gray-800 dark:to-cyan-900/10"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("completionRate")}
                  </span>
                  <span className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                    {task?.success_rate || 0}%
                  </span>
                </div>
                <ProgressBar
                  value={task?.success_rate || 0}
                  height="h-3"
                  color="cyan"
                  animated
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {subTasks.length}
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    {t("totalSubTasks")}
                  </div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">
                    {subTaskStats.completed}
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

      {/* Pause/Resume Confirmation Modal */}
      <Modal
        isOpen={pauseResumeModalOpen}
        onClose={() => {
          setPauseResumeModalOpen(false);
          setPauseResumeAction("");
        }}
        title={pauseResumeAction === "pause" ? t("pauseTask") : t("resumeTask")}
        size="md">
        <div className="space-y-4">
          <div className={`p-3 rounded-lg ${
            pauseResumeAction === "pause" 
              ? "bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20" 
              : "bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20"
          }`}>
            <p className={`text-center font-medium ${
              pauseResumeAction === "pause" 
                ? "text-orange-700 dark:text-orange-300" 
                : "text-emerald-700 dark:text-emerald-300"
            }`}>
              {pauseResumeAction === "pause"
                ? t("confirmPauseTask", { taskName: task?.name })
                : t("confirmResumeTask", { taskName: task?.name })}
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setPauseResumeModalOpen(false);
                setPauseResumeAction("");
              }}>
              {t("cancel")}
            </Button>
            <Button
              onClick={handleConfirmPauseResume}
              variant={pauseResumeAction === "pause" ? "warning" : "primary"}
              className={`flex items-center gap-2 ${
                pauseResumeAction === "pause" 
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                  : "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
              }`}>
              {pauseResumeAction === "pause" ? <Pause size={16} /> : <Play size={16} />}
              {pauseResumeAction === "pause" ? t("pause") : t("resume")}
            </Button>
          </div>
        </div>
      </Modal>

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