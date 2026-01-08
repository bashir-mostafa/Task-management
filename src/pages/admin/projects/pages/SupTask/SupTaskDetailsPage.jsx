// src/pages/admin/projects/pages/SupTask/SupTaskDetailsPage.jsx
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
  Trash2,
  Edit,
  Pencil,
  Plus,
  Eye,
  Users,
  Star,
  Building,
  GitBranch,
  Activity,
  ExternalLink,
  FilePlus,
  Pause,
  Play,
  UserPlus,
  Target,
  BarChart3
} from "lucide-react";

import { supTaskService } from "../../services/supTaskService";
import { taskService } from "../../services/taskService";
import { userService } from "../../../users/services/userService";
import { projectService } from "../../services/projectService";

import DetailsLayout from "../../../../../components/Layout/DetailsLayout";
import DetailsCard from "../../../../../components/UI/DetailsCard";
import ProgressBar from "../../../../../components/UI/ProgressBar";
import DetailItem from "../../../../../components/UI/DetailItem";
import ButtonHero from "../../../../../components/UI/ButtonHero";
import Toast from "../../../../../components/Toast";
import DeleteConfirmationModal from "../../../../../components/UI/DeleteConfirmationModal";

export default function SupTaskDetailsPage() {
  const { projectId, taskId, supTaskId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [supTask, setSupTask] = useState(null);
  const [parentTask, setParentTask] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingParentTask, setLoadingParentTask] = useState(false);
  const [loadingProject, setLoadingProject] = useState(false);
  const [error, setError] = useState("");
  const [isRTL] = useState(i18n.language === "ar");

  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // تعريف الحالات للمهمات الفرعية من الـ API
  const statusColors = {
    Notimplemented: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border border-gray-200 dark:border-gray-800",
    Underimplementation: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
    Complete: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800",
    Pause: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800",
  };

  const statusIcons = {
    Notimplemented: <Clock size={16} className="text-gray-600 dark:text-gray-400" />,
    Underimplementation: <AlertCircle size={16} className="text-blue-600 dark:text-blue-400" />,
    Complete: <CheckCircle size={16} className="text-green-600 dark:text-green-400" />,
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

  // دالة للحصول على نص الحالة مع الترجمة
  const getTranslatedStatusText = (statusString) => {
    return t(getStatusText(statusString));
  };

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  useEffect(() => {
    fetchSupTaskDetails();
    fetchParentTaskDetails();
    fetchProjectDetails();
  }, [supTaskId, taskId, projectId]);

  const fetchSupTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await supTaskService.getSupTaskById(supTaskId);
      if (response) {
        setSupTask(response);
      } else {
        setError(t("supTaskNotFound"));
        showToast(t("supTaskNotFound"), "error");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("fetchError");
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchParentTaskDetails = async () => {
    try {
      setLoadingParentTask(true);
      const response = await taskService.getTaskById(taskId);
      if (response) {
        setParentTask(response);
      }
    } catch (error) {
      console.error("Error fetching parent task details:", error);
    } finally {
      setLoadingParentTask(false);
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

  const handleEditTask = () => {
    navigate(`/projects/${projectId}/tasks/${taskId}/subtasks/${supTaskId}/edit`);
  };

  const handleDeleteTask = () => {
    setTaskToDelete(supTask);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await supTaskService.deleteSupTask(supTaskId);
      showToast(t("supTaskDeletedSuccessfully"), "success");
      setTimeout(() => {
        navigate(`/projects/${projectId}/tasks/${taskId}/subtasks`);
      }, 1500);
    } catch (error) {
      showToast(error.response?.data?.message || t("deleteError"), "error");
    } finally {
      setDeleteModalOpen(false);
      setTaskToDelete(null);
    }
  };

  const handleBack = () => {
    navigate(`/projects/${projectId}/tasks/${taskId}/subtasks`);
  };

  const handleViewParentTask = () => {
    navigate(`/projects/${projectId}/tasks/${taskId}`);
  };

  const statusText = supTask?.status ? t(getStatusText(supTask.status)) : "";

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
      title={supTask?.name}
      subtitle={t("supTaskDetails")}
      id={supTask?.id}
      status={supTask?.status}
      statusColors={statusColors}
      statusIcons={statusIcons}
      statusTexts={supTask?.status ? { [supTask.status]: getTranslatedStatusText(supTask.status) } : {}}
      loading={loading}
      error={error || (!supTask && !loading ? t("supTaskNotFound") : null)}
      onEdit={handleEditTask}
      onBack={handleBack}
      backLabel={t("backToSupTasks")}
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
                {supTask?.description || t("noDescription")}
              </p>
            </div>
            {supTask?.user_notes && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                  <Pencil size={16} />
                  {t("userNotes")}
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  {supTask.user_notes}
                </p>
              </div>
            )}
          </DetailsCard>

          {/* Parent Task Info Card */}
          <DetailsCard
            title={t("parentTaskInformation")}
            icon={GitBranch}
            actions={
              <div className="flex gap-2">
                <ButtonHero
                  onClick={handleViewParentTask}
                  variant="info"
                  size="sm"
                  isRTL={isRTL}
                  icon={ExternalLink}
                  iconPosition={isRTL ? "right" : "left"}
                  className="flex items-center gap-2"
                >
                  {t("viewParentTask")}
                </ButtonHero>
              </div>
            }>
            
            {/* Parent Task Details */}
            <div className="space-y-4">
              {loadingParentTask ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    {t("loading")}
                  </p>
                </div>
              ) : parentTask ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <GitBranch size={20} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {parentTask.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t("parentTask")} #{parentTask.id}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      parentTask.status === 'Complete' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                      parentTask.status === 'Underimplementation' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                      parentTask.status === 'Pause' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                    }`}>
                      {t(getStatusText(parentTask.status))}
                    </span>
                  </div>
                  
                  {parentTask.description && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {parentTask.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t("startDate")}: {parentTask.start_date ? new Date(parentTask.start_date).toLocaleDateString() : t("notSet")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t("endDate")}: {parentTask.end_date ? new Date(parentTask.end_date).toLocaleDateString() : t("notSet")}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  {t("parentTaskNotFound")}
                </div>
              )}
            </div>
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
                  {t("supTaskID")}:
                </span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  #{supTask?.id}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("parentTask")}:
                </span>
                <div className="flex items-center gap-2">
                  {loadingParentTask ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  ) : (
                    <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                      <GitBranch size={14} />
                      {parentTask?.name || `Task #${taskId}`}
                    </span>
                  )}
                </div>
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
                  supTask?.start_date
                    ? new Date(supTask.start_date).toLocaleDateString()
                    : t("notSet")
                }
                color="blue"
                isRTL={isRTL}
              />
              <DetailItem
                icon={Calendar}
                title={t("endDate")}
                value={
                  supTask?.end_date
                    ? new Date(supTask.end_date).toLocaleDateString()
                    : t("notSet")
                }
                color="orange"
                isRTL={isRTL}
              />
              
              {/* Assigned User */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("assignedUser")}:
                </span>
                <div className="flex items-center gap-2">
                  {supTask?.user ? (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <User size={14} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {supTask.user.username}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {supTask.user.role}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {t("unassigned")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </DetailsCard>

          {/* Quick Actions Card */}
          <DetailsCard 
            title={t("quickActions")} 
            icon={Target}
          >
            <div className="space-y-2">
              {/* View Parent Task */}
              <ButtonHero
                onClick={handleViewParentTask}
                variant="primary"
                size="md"
                isRTL={isRTL}
                icon={Eye}
                iconPosition={isRTL ? "right" : "left"}
                fullWidth={true}
                className="justify-start"
              >
                {t("viewParentTask")}
              </ButtonHero>

              {/* Edit SupTask */}
              <ButtonHero
                onClick={handleEditTask}
                variant="success"
                size="md"
                isRTL={isRTL}
                icon={Edit}
                iconPosition={isRTL ? "right" : "left"}
                fullWidth={true}
                className="justify-start"
              >
                {t("editSupTask")}
              </ButtonHero>

              {/* Delete SupTask */}
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
                {t("deleteSupTask")}
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
                    {t("currentStatus")}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
                    statusColors[supTask?.status] || statusColors.Notimplemented
                  }`}>
                    {statusIcons[supTask?.status] || statusIcons.Notimplemented}
                    {statusText}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {supTask?.taskid || 0}
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    {t("parentTaskID")}
                  </div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">
                    {supTask?.user?.id ? '✓' : '✗'}
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                    {t("userAssigned")}
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
        type="supTask"
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