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
} from "lucide-react";
import { taskService } from "../../services/taskService";
import { supTaskService } from "../../services/supTaskService";
import { userService } from "../../../users/services/userService";
import { projectService } from "../../../projects/services/projectService"; // أضف هذا الاستيراد

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
  const [project, setProject] = useState(null); // حالة جديدة للمشروع
  const [subTasks, setSubTasks] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProject, setLoadingProject] = useState(false); // حالة تحميل المشروع
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
    fetchProjectDetails(); // جلب تفاصيل المشروع
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
        console.warn("Project not found or response structure is different");
        // إذا لم ينجح الحصول على المشروع، يمكنك تعيين قيمة افتراضية
        setProject({
          id: projectId,
          name: `Project #${projectId}`,
          description: "Project details not available",
        });
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
      // في حالة الخطأ، نعرض ID فقط
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
      // استبدل هذا بطلب API الفعلي لجلب المستخدمين المعينين للمهمة
      const response = await userService.getUsers();
      // افترضنا أن جميع المستخدمين معينين لهذه المهمة (يجب تعديل هذا حسب API الخاص بك)
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

  // عرض النجوم للتقييم
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
      onDelete={handleDeleteTask}
      onBack={handleBack}
      backLabel={t("backToTasks")}
      isRTL={isRTL}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Description */}
          <DetailsCard title={t("taskDescription")} icon={FileText}>
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

          {/* SubTasks */}
          <DetailsCard
            title={t("subTasks")}
            icon={CheckCircle}
            actions={
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleViewSubTasksList}
                  variant="secondary"
                  size="sm"
                  className={`flex items-center gap-2 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}>
                  <List size={14} />
                  {t("viewSubTasksList")}
                </Button>
                <Button
                  onClick={handleAddSubTask}
                  variant="secondary"
                  size="sm"
                  className={`flex items-center gap-2 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}>
                  <Plus size={14} />
                  {t("addSubTask")}
                </Button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({subTasks.length})
                </span>
              </div>
            }>
            {loadingSubTasks ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  {t("loading")}
                </p>
              </div>
            ) : subTasks.length > 0 ? (
              <div className="space-y-3">
                {subTasks.slice(0, 5).map((subTask) => (
                  <div
                    key={subTask.id}
                    className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all cursor-pointer"
                    onClick={() => handleViewSubTask(subTask.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            subTask.status === 2
                              ? "bg-green-500"
                              : subTask.status === 1
                              ? "bg-blue-500"
                              : "bg-gray-400"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-800 dark:text-white">
                            {subTask.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {subTask.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                          {subTask.user?.username
                            ? `User: ${subTask.user.username}`
                            : t("unassigned")}
                        </span>
                        <ChevronRight size={16} className="text-gray-400" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          {t("startDate")}:
                        </span>
                        <span className="ml-2 text-gray-800 dark:text-gray-300">
                          {subTask.start_date
                            ? new Date(subTask.start_date).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          {t("endDate")}:
                        </span>
                        <span className="ml-2 text-gray-800 dark:text-gray-300">
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
                      className={`flex items-center gap-2 mx-auto ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}>
                      <ChevronRight size={14} />
                      {t("viewAllSubTasks")} ({subTasks.length})
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {t("noSubTasks")}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={handleAddSubTask}
                    className={`flex items-center gap-2 mx-auto ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}>
                    <Plus size={16} />
                    <span>{t("createFirstSubTask")}</span>
                  </Button>
                  <Button
                    onClick={handleViewSubTasksList}
                    variant="outline"
                    className={`flex items-center gap-2 mx-auto ${
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

        {/* Right Column - Enhanced */}
        <div className="space-y-6">
          {/* Task Details Card */}
          <DetailsCard title={t("taskInformation")} icon={FileText}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("taskID")}:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  #{task?.id}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("project")}:
                </span>
                <div className="flex items-center gap-2">
                  {loadingProject ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
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
                icon={User}
                title={t("createdBy")}
                value={task?.create_by || t("unknown")}
                color="green"
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

          {/* Project Info Card */}
          <DetailsCard title={t("projectInfo")} icon={Building}>
            {loadingProject ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                  {t("loading")}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("projectName")}:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {project?.name || `Project #${projectId}`}
                  </span>
                </div>

                {project?.description && (
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                      {t("description")}:
                    </span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {project.description}
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => navigate(`/projects/${projectId}`)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1">
                    <FolderTree size={14} />
                    {t("viewProjectDetails")}
                  </button>
                </div>
              </div>
            )}
          </DetailsCard>

          {/* Task Progress Card */}
          <DetailsCard title={t("progressStatistics")} icon={BarChart3}>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("completionRate")}
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {task?.success_rate || 0}%
                  </span>
                </div>
                <ProgressBar
                  value={task?.success_rate || 0}
                  height="h-3"
                  color="primary"
                  animated
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {subTasks.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t("subTasks")}
                  </div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {subTasks.filter((st) => st.status === 2).length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t("completed")}
                  </div>
                </div>
              </div>
            </div>
          </DetailsCard>

          {/* Assigned Users Card */}
          <DetailsCard
            title={t("assignedUsers")}
            icon={Users}
            actions={
              <Button
                onClick={handleAssignUsers}
                variant="secondary"
                size="sm"
                className={`flex items-center gap-2 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}>
                <UserPlus size={14} />
                {t("assign")}
              </Button>
            }>
            {loadingUsers ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                  {t("loading")}
                </p>
              </div>
            ) : assignedUsers.length > 0 ? (
              <div className="space-y-3">
                {assignedUsers.slice(0, 3).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User size={14} className="text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {user.username}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        user.role === "Admin"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      }`}>
                      {user.role}
                    </span>
                  </div>
                ))}
                {assignedUsers.length > 3 && (
                  <div className="text-center pt-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      + {assignedUsers.length - 3} {t("moreUsers")}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Users size={32} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                  {t("noAssignedUsers")}
                </p>
                <Button
                  onClick={handleAssignUsers}
                  variant="outline"
                  size="sm"
                  className={`flex items-center gap-2 mx-auto ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}>
                  <UserPlus size={14} />
                  {t("assignUsers")}
                </Button>
              </div>
            )}
          </DetailsCard>

          {/* Task Actions Card */}
          <DetailsCard title={t("taskActions")} icon={Target}>
            <div className="space-y-2">
              <Button
                onClick={handleViewSubTasksList}
                variant="secondary"
                className={`w-full justify-start ${
                  isRTL ? "flex-row-reverse" : ""
                }`}>
                <List size={16} className={isRTL ? "ml-2" : "mr-2"} />
                {t("viewSubTasksList")}
              </Button>

              <Button
                onClick={handleEditTask}
                variant="secondary"
                className={`w-full justify-start ${
                  isRTL ? "flex-row-reverse" : ""
                }`}>
                <Pencil size={16} className={isRTL ? "ml-2" : "mr-2"} />
                {t("editTask")}
              </Button>

              <Button
                onClick={handleAssignUsers}
                variant="secondary"
                className={`w-full justify-start ${
                  isRTL ? "flex-row-reverse" : ""
                }`}>
                <UserCheck size={16} className={isRTL ? "ml-2" : "mr-2"} />
                {t("assignUsers")}
              </Button>

              <Button
                onClick={handleAddSubTask}
                variant="secondary"
                className={`w-full justify-start ${
                  isRTL ? "flex-row-reverse" : ""
                }`}>
                <Plus size={16} className={isRTL ? "ml-2" : "mr-2"} />
                {t("addSubTask")}
              </Button>

              {/* Pause/Resume Task Button */}
              {task?.status === "Underimplementation" && (
                <Button
                  onClick={handlePauseTask}
                  variant="warning"
                  className={`w-full justify-start ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}>
                  <Pause size={16} className={isRTL ? "ml-2" : "mr-2"} />
                  {t("pauseTask")}
                </Button>
              )}

              {task?.status === "Pause" && (
                <Button
                  onClick={handleResumeTask}
                  variant="success"
                  className={`w-full justify-start ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}>
                  <Play size={16} className={isRTL ? "ml-2" : "mr-2"} />
                  {t("resumeTask")}
                </Button>
              )}

              <Button
                onClick={handleDeleteTask}
                variant="danger"
                className={`w-full justify-start ${
                  isRTL ? "flex-row-reverse" : ""
                }`}>
                <Trash2 size={16} className={isRTL ? "ml-2" : "mr-2"} />
                {t("deleteTask")}
              </Button>
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
          <p className="text-gray-600 dark:text-gray-300">
            {pauseResumeAction === "pause"
              ? t("confirmPauseTask", { taskName: task?.name })
              : t("confirmResumeTask", { taskName: task?.name })}
          </p>
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
              className="flex items-center gap-2">
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
