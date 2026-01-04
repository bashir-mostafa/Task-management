// src/pages/admin/projects/pages/ProjectTaskDetailsPage.jsx
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
} from "lucide-react";
import { taskService } from "../../services/taskService";
import { supTaskService } from "../../services/supTaskService";

import DetailsLayout from "../../../../../components/Layout/DetailsLayout";
import DetailsCard from "../../../../../components/UI/DetailsCard";
import StatCard from "../../../../../components/UI/StatCard";
import ProgressBar from "../../../../../components/UI/ProgressBar";
import DetailItem from "../../../../../components/UI/DetailItem";
import Button from "../../../../../components/UI/Button";
import Toast from "../../../../../components/Toast";

export default function ProjectTaskDetailsPage() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [task, setTask] = useState(null);
  const [subTasks, setSubTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubTasks, setLoadingSubTasks] = useState(false);
  const [error, setError] = useState("");
  const [isRTL] = useState(i18n.language === "ar");

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const statusColors = {
    "Notimplemented": "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border border-gray-200 dark:border-gray-800",
    "Underimplementation": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
    "Complete": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800",
    "Pause": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800",
  };

  const statusIcons = {
    "Notimplemented": <Clock size={16} className="text-gray-600" />,
    "Underimplementation": <AlertCircle size={16} className="text-blue-600" />,
    "Complete": <CheckCircle size={16} className="text-green-600" />,
    "Pause": <Pause size={16} className="text-orange-600" />,
  };

  const getStatusText = (statusString) => {
    const statusMap = {
      "Notimplemented": "notImplemented",
      "Underimplementation": "underImplementation",
      "Complete": "completed",
      "Pause": "paused",
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
  }, [projectId, taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTaskById(taskId);
      if (response) {
        setTask(response);
        fetchSubTasks();
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

  const handleAddSubTask = () => {
    navigate(`/projects/${projectId}/tasks/${taskId}/subtasks/create`);
  };

  const handleEditTask = () => {
    navigate(`/projects/${projectId}/tasks/${taskId}/edit`);
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

  const statusText = task?.status ? t(getStatusText(task.status)) : "";

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
      isRTL={isRTL}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Description */}
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

          {/* SubTasks */}
          <DetailsCard
            title={t("subTasks")}
            icon={CheckCircle}
            actions={
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleAddSubTask}
                  variant="secondary"
                  size="sm"
                  className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <Plus size={14} />
                  {t("addSubTask")}
                </Button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({subTasks.length})
                </span>
              </div>
            }
          >
            {loadingSubTasks ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-2">{t("loading")}</p>
              </div>
            ) : subTasks.length > 0 ? (
              <div className="space-y-3">
                {subTasks.map((subTask) => (
                  <div
                    key={subTask.id}
                    className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all cursor-pointer"
                    onClick={() => handleViewSubTask(subTask.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-2 h-2 rounded-full ${
                          subTask.status === 2 ? 'bg-green-500' :
                          subTask.status === 1 ? 'bg-blue-500' :
                          'bg-gray-400'
                        }`} />
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
                          {subTask.user?.username ? `User: ${subTask.user.username}` : t("unassigned")}
                        </span>
                        <ChevronRight size={16} className="text-gray-400" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">{t("startDate")}:</span>
                        <span className="ml-2 text-gray-800 dark:text-gray-300">
                          {subTask.start_date ? new Date(subTask.start_date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">{t("endDate")}:</span>
                        <span className="ml-2 text-gray-800 dark:text-gray-300">
                          {subTask.end_date ? new Date(subTask.end_date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {t("noSubTasks")}
                </p>
                <Button
                  onClick={handleAddSubTask}
                  className={`flex items-center gap-2 mx-auto ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <Plus size={16} />
                  <span>{t("createFirstSubTask")}</span>
                </Button>
              </div>
            )}
          </DetailsCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Task Details */}
          <DetailsCard title={t("taskDetails")}>
            <div className="space-y-4">
              <DetailItem
                icon={Calendar}
                title={t("startDate")}
                value={task?.start_date ? new Date(task.start_date).toLocaleDateString() : t("notSet")}
                color="blue"
                isRTL={isRTL}
              />
              <DetailItem
                icon={Calendar}
                title={t("endDate")}
                value={task?.end_date ? new Date(task.end_date).toLocaleDateString() : t("notSet")}
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
                value={`${task?.evaluation_admin || 0}/10`}
                color="purple"
                isRTL={isRTL}
              />
            </div>
          </DetailsCard>

          {/* Task Progress */}
          <DetailsCard
            title={t("taskProgress")}
            icon={BarChart3}
            actions={
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {task?.success_rate || 0}%
              </span>
            }
          >
            <ProgressBar
              value={task?.success_rate || 0}
              label={t("completionRate")}
              animated
            />
          </DetailsCard>

          {/* Quick Actions */}
          <DetailsCard title={t("quickActions")}>
            <div className="space-y-2">
              <Button
                onClick={handleEditTask}
                variant="secondary"
                className={`w-full justify-start ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <Pencil size={16} className={isRTL ? "ml-2" : "mr-2"} />
                {t("editTask")}
              </Button>
              <Button
                onClick={handleAssignUsers}
                variant="secondary"
                className={`w-full justify-start ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <UserCheck size={16} className={isRTL ? "ml-2" : "mr-2"} />
                {t("assignUsers")}
              </Button>
              <Button
                onClick={handleAddSubTask}
                variant="secondary"
                className={`w-full justify-start ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <Plus size={16} className={isRTL ? "ml-2" : "mr-2"} />
                {t("addSubTask")}
              </Button>
              {task?.status === "Underimplementation" && (
                <Button
                  onClick={handlePauseTask}
                  variant="secondary"
                  className={`w-full justify-start ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <Pause size={16} className={isRTL ? "ml-2" : "mr-2"} />
                  {t("pauseTask")}
                </Button>
              )}
              {task?.status === "Pause" && (
                <Button
                  onClick={handleResumeTask}
                  variant="secondary"
                  className={`w-full justify-start ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <Play size={16} className={isRTL ? "ml-2" : "mr-2"} />
                  {t("resumeTask")}
                </Button>
              )}
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
        />
      )}
    </DetailsLayout>
  );
}