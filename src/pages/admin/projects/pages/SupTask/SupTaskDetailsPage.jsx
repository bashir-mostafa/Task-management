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
  RefreshCw,
  UserCheck,
  Target,
  BarChart3,
  TextAlignCenter,
  Pencil,
  ArrowLeft,
  Plus,
  List,
  Eye,
  Edit as EditIcon,
  Users,
  Star,
  TrendingUp,
  Award,
  Zap,
  ChevronRight,
  UserPlus,
  Play,
  Pause,
} from "lucide-react";

import { supTaskService } from "../../services/supTaskService";
import { taskService } from "../../services/taskService";

import DetailsLayout from "../../../../../components/Layout/DetailsLayout";
import DetailsCard from "../../../../../components/UI/DetailsCard";
import StatCard from "../../../../../components/UI/StatCard";
import ProgressBar from "../../../../../components/UI/ProgressBar";
import DetailItem from "../../../../../components/UI/DetailItem";
import Button from "../../../../../components/UI/Button";
import Toast from "../../../../../components/Toast";
import Modal from "../../../../../components/UI/Modal";
import DeleteConfirmationModal from "../../../../../components/UI/DeleteConfirmationModal";

export default function SupTaskDetailsPage() {
  const { projectId, taskId, supTaskId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [supTask, setSupTask] = useState(null);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [userNotes, setUserNotes] = useState("");

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const isRTL = i18n.language === "ar";

  const statusColors = {
    0: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border border-gray-200 dark:border-gray-800",
    1: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
    2: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800",
  };

  const statusIcons = {
    0: <Clock size={16} className="text-gray-600 dark:text-gray-400" />,
    1: <AlertCircle size={16} className="text-blue-600 dark:text-blue-400" />,
    2: <CheckCircle size={16} className="text-green-600 dark:text-green-400" />,
  };

  const statusTexts = {
    0: t("pending"),
    1: t("inProgress"),
    2: t("completed"),
  };

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  useEffect(() => {
    fetchSupTaskDetails();
  }, [supTaskId, taskId]);

  const fetchSupTaskDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const taskData = await taskService.getTaskById(taskId);
      setTask(taskData);

      const supTaskData = await supTaskService.getSupTaskById(supTaskId);
      setSupTask(supTaskData);
      setUserNotes(supTaskData.user_notes || "");
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("fetchError");
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      const updatedData = {
        ...supTask,
        status: newStatus,
        completed: newStatus === 2,
      };
      await supTaskService.updateSupTask(supTaskId, updatedData);
      showToast(t("statusUpdatedSuccessfully"), "success");
      fetchSupTaskDetails();
    } catch (error) {
      showToast(error.response?.data?.message || t("updateError"), "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      setUpdating(true);
      await supTaskService.addUserNotes(supTaskId, userNotes);
      showToast(t("notesSavedSuccessfully"), "success");
      setNotesModalOpen(false);
      fetchSupTaskDetails();
    } catch (error) {
      showToast(error.response?.data?.message || t("saveError"), "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await supTaskService.deleteSupTask(supTaskId);
      showToast(t("supTaskDeletedSuccessfully"), "success");
      setDeleteModalOpen(false);
      navigate(`/projects/${projectId}/tasks/${taskId}/subtasks`);
    } catch (error) {
      showToast(error.response?.data?.message || t("deleteError"), "error");
    }
  };

  const handleEdit = () => {
    navigate(
      `/projects/${projectId}/tasks/${taskId}/subtasks/${supTaskId}/edit`
    );
  };

  const handleBack = () => {
    navigate(`/projects/${projectId}/tasks/${taskId}/subtasks`);
  };

  const handleViewTaskDetails = () => {
    navigate(`/projects/${projectId}/tasks/${taskId}`);
  };

  // عرض النجوم للتقييم
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          className={i <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300 dark:text-gray-600"}
        />
      );
    }
    return stars;
  };

  // Action buttons configuration
  const actionButtons = [
    {
      id: 'view-task',
      label: t("viewTask"),
      onClick: handleViewTaskDetails,
      icon: <Eye size={18} />,
      variant: 'primary',
      className: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg',
    },
    {
      id: 'edit',
      label: t("editSupTask"),
      onClick: handleEdit,
      icon: <EditIcon size={18} />,
      variant: 'secondary',
      className: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg',
    },
    {
      id: 'delete',
      label: t("deleteSupTask"),
      onClick: handleDeleteClick,
      icon: <Trash2 size={18} />,
      variant: 'danger',
      className: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg',
    },
  ];

  return (
    <DetailsLayout
      title={supTask?.name}
      subtitle={t("supTaskDetails")}
      id={supTask?.id}
      status={supTask?.status}
      statusColors={statusColors}
      statusIcons={statusIcons}
      statusTexts={statusTexts}
      loading={loading}
      error={error || (!supTask && !loading ? t("supTaskNotFound") : null)}
      onBack={handleBack}
      backLabel={t("backToSupTasks")}
      isRTL={isRTL}
    >
      {/* Action Buttons Header */}
      <div className={`flex flex-wrap gap-3 mb-8 p-4 bg-navbar-light dark:bg-navbar-dark rounded-2xl border border-border ${isRTL ? 'flex-row-reverse' : ''}`}>
        {actionButtons.map((button) => (
          <Button
            key={button.id}
            onClick={button.onClick}
            variant={button.variant}
            className={`flex items-center gap-2 px-5 py-2.5 font-medium rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${button.className} ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            {button.icon}
            {button.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <DetailsCard 
            title={t("supTaskDescription")} 
            icon={FileText}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-600/50"
          >
            <div className="prose dark:prose-invert max-w-none p-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                {supTask?.description || t("noDescription")}
              </p>
            </div>
          </DetailsCard>

          {/* User Notes */}
          <DetailsCard
            title={t("userNotes")}
            icon={TextAlignCenter}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-600/50"
            actions={
              <Button
                onClick={() => setNotesModalOpen(true)}
                variant="secondary"
                size="sm"
                className={`flex items-center gap-2 ${
                  isRTL ? "flex-row-reverse" : ""
                } bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white`}
              >
                <Pencil size={14} />
                <span>{t("editNotes")}</span>
              </Button>
            }
          >
            {supTask?.user_notes ? (
              <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900/20 dark:to-blue-900/10 rounded-xl border border-gray-200 dark:border-gray-600">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                  {supTask.user_notes}
                </p>
                {supTask.completed && (
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                    <CheckCircle size={14} />
                    <span>{t("taskCompleted")}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-800 dark:to-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TextAlignCenter size={24} className="text-gray-400 dark:text-gray-500" />
                </div>
                <p className="mb-4">{t("noUserNotes")}</p>
                <Button
                  onClick={() => setNotesModalOpen(true)}
                  variant="secondary"
                  className={`flex items-center gap-2 mx-auto ${isRTL ? 'flex-row-reverse' : ''} bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white`}
                >
                  <Plus size={16} />
                  {t("addNotes")}
                </Button>
              </div>
            )}
          </DetailsCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* SupTask Details */}
          <DetailsCard 
            title={t("supTaskDetails")}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-600/50"
          >
            <div className="space-y-5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("supTaskID")}:</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg">
                  #{supTask?.id}
                </span>
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
                className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg"
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
                className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg"
              />
              <DetailItem
                icon={User}
                title={t("assignedUser")}
                value={
                  supTask?.user_id ? (
                    <span className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                      <UserCheck size={14} />
                      {t("user")} #{supTask.user_id}
                    </span>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">{t("unassigned")}</span>
                  )
                }
                color="green"
                isRTL={isRTL}
                className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg"
              />
              <DetailItem
                icon={Target}
                title={t("parentTask")}
                value={
                  <button
                    onClick={handleViewTaskDetails}
                    className="text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                      {task?.name}
                    </span>
                    <ChevronRight size={14} className="inline ml-1" />
                  </button>
                }
                color="purple"
                isRTL={isRTL}
                className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg"
              />
            </div>
          </DetailsCard>

          {/* Status Change */}
          <DetailsCard 
            title={t("changeStatus")}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-600/50"
          >
            <div className="space-y-3 p-4">
              <Button
                onClick={() => handleUpdateStatus(0)}
                disabled={updating || supTask?.status === 0}
                variant={supTask?.status === 0 ? "primary" : "secondary"}
                className={`w-full justify-start py-3 ${
                  isRTL ? "flex-row-reverse" : ""
                } ${supTask?.status === 0 
                  ? 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white' 
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Clock size={18} className={isRTL ? "ml-3" : "mr-3"} />
                {t("setPending")}
              </Button>
              <Button
                onClick={() => handleUpdateStatus(1)}
                disabled={updating || supTask?.status === 1}
                variant={supTask?.status === 1 ? "primary" : "secondary"}
                className={`w-full justify-start py-3 ${
                  isRTL ? "flex-row-reverse" : ""
                } ${supTask?.status === 1 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white' 
                  : 'bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 hover:from-blue-200 hover:to-blue-300 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30 text-blue-700 dark:text-blue-300'
                }`}
              >
                <AlertCircle size={18} className={isRTL ? "ml-3" : "mr-3"} />
                {t("setInProgress")}
              </Button>
              <Button
                onClick={() => handleUpdateStatus(2)}
                disabled={updating || supTask?.status === 2}
                variant={supTask?.status === 2 ? "primary" : "secondary"}
                className={`w-full justify-start py-3 ${
                  isRTL ? "flex-row-reverse" : ""
                } ${supTask?.status === 2 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white' 
                  : 'bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 hover:from-green-200 hover:to-green-300 dark:hover:from-green-800/30 dark:hover:to-green-700/30 text-green-700 dark:text-green-300'
                }`}
              >
                <CheckCircle size={18} className={isRTL ? "ml-3" : "mr-3"} />
                {t("setCompleted")}
              </Button>
            </div>
          </DetailsCard>

          {/* Quick Actions */}
          <DetailsCard 
            title={t("quickActions")}
            icon={Zap}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-600/50"
          >
            <div className="space-y-2 p-4">
              <Button
                onClick={handleEdit}
                variant="secondary"
                className={`w-full justify-start py-3 text-left ${
                  isRTL ? "flex-row-reverse" : ""
                } bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30 border border-blue-200/50 dark:border-blue-700/30`}
              >
                <Pencil size={18} className={isRTL ? "ml-3" : "mr-3"} />
                {t("editSupTask")}
              </Button>
              <Button
                onClick={() => setNotesModalOpen(true)}
                variant="secondary"
                className={`w-full justify-start py-3 text-left ${
                  isRTL ? "flex-row-reverse" : ""
                } bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-800/30 dark:hover:to-purple-700/30 border border-purple-200/50 dark:border-purple-700/30`}
              >
                <TextAlignCenter size={18} className={isRTL ? "ml-3" : "mr-3"} />
                {t("editNotes")}
              </Button>
              <Button
                onClick={fetchSupTaskDetails}
                variant="secondary"
                className={`w-full justify-start py-3 text-left ${
                  isRTL ? "flex-row-reverse" : ""
                } bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 hover:from-green-100 hover:to-green-200 dark:hover:from-green-800/30 dark:hover:to-green-700/30 border border-green-200/50 dark:border-green-700/30`}
              >
                <RefreshCw size={18} className={isRTL ? "ml-3" : "mr-3"} />
                {t("refresh")}
              </Button>
              <Button
                onClick={handleViewTaskDetails}
                variant="secondary"
                className={`w-full justify-start py-3 text-left ${
                  isRTL ? "flex-row-reverse" : ""
                } bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 hover:from-yellow-100 hover:to-yellow-200 dark:hover:from-yellow-800/30 dark:hover:to-yellow-700/30 border border-yellow-200/50 dark:border-yellow-700/30`}
              >
                <Eye size={18} className={isRTL ? "ml-3" : "mr-3"} />
                {t("viewParentTask")}
              </Button>
            </div>
          </DetailsCard>

          {/* Progress Statistics */}
          <DetailsCard
            title={t("progressStatistics")}
            icon={TrendingUp}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-600/50"
          >
            <div className="space-y-5 p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("progress")}</span>
                  <span className="text-xl font-bold text-primary bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                    {supTask?.success_rate || 0}%
                  </span>
                </div>
                <ProgressBar
                  value={supTask?.success_rate || 0}
                  height="h-3"
                  color={
                    supTask?.status === 2 ? 'green' :
                    supTask?.status === 1 ? 'blue' : 'gray'
                  }
                  animated
                  gradient
                />
              </div>

              <div className="pt-5 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("currentStatus")}</span>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${
                    statusColors[supTask?.status] || statusColors[0]
                  }`}>
                    {statusIcons[supTask?.status]}
                    {statusTexts[supTask?.status]}
                  </span>
                </div>
              </div>
            </div>
          </DetailsCard>
        </div>
      </div>

      {/* Edit Notes Modal */}
      {notesModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {t("editUserNotes")}
            </h3>
            <textarea
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              rows={6}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder={t("enterUserNotes")}
            />
            <div
              className={`flex justify-end gap-3 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <Button
                onClick={() => setNotesModalOpen(false)}
                variant="secondary"
                className="px-4 py-2"
              >
                {t("cancel")}
              </Button>
              <Button 
                onClick={handleSaveNotes} 
                disabled={updating}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                {updating ? t("saving") : t("saveNotes")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={supTask?.name}
        type="supTask"
      />

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