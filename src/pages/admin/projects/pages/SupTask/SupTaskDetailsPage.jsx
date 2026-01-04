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
} from "lucide-react";
import { supTaskService } from "../../services/supTaskService";
import { taskService } from "../../services/taskService";

import DetailsLayout from "../../../../../components/Layout/DetailsLayout";
import DetailsCard from "../../../../../components/UI/DetailsCard";
import StatCard from "../../../../../components/UI/StatCard";
import ProgressBar from "../../../../../components/UI/ProgressBar";
import DetailItem from "../../../../../components/UI/DetailItem";
import Button from "../../../../../components/UI/Button";
import DeleteConfirmationModal from "../../../../../components/UI/DeleteConfirmationModal";
import Toast from "../../../../../components/Toast";

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
    0: <Clock size={16} className="text-gray-600" />,
    1: <AlertCircle size={16} className="text-blue-600" />,
    2: <CheckCircle size={16} className="text-green-600" />,
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
      onEdit={handleEdit}
      onDelete={handleDeleteClick}
      onBack={handleBack}
      backLabel={t("backToSupTasks")}
      isRTL={isRTL}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <DetailsCard title={t("supTaskDescription")} icon={FileText}>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {supTask?.description || t("noDescription")}
              </p>
            </div>
          </DetailsCard>

          {/* User Notes */}
          <DetailsCard
            title={t("userNotes")}
            icon={TextAlignCenter}
            actions={
              <Button
                onClick={() => setNotesModalOpen(true)}
                variant="secondary"
                size="sm"
                className={`flex items-center gap-2 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}>
                <Pencil size={14} />
                <span>{t("editNotes")}</span>
              </Button>
            }>
            {supTask?.user_notes ? (
              <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-600">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {supTask.user_notes}
                </p>
                {supTask.completed && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle size={14} />
                    <span>{t("taskCompleted")}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <TextAlignCenter
                  size={48}
                  className="mx-auto mb-4 opacity-50"
                />
                <p>{t("noUserNotes")}</p>
                <Button
                  onClick={() => setNotesModalOpen(true)}
                  variant="secondary"
                  className="mt-4">
                  {t("addNotes")}
                </Button>
              </div>
            )}
          </DetailsCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* SupTask Details */}
          <DetailsCard title={t("supTaskDetails")}>
            <div className="space-y-4">
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
              <DetailItem
                icon={User}
                title={t("assignedUser")}
                value={
                  supTask?.user_id ? (
                    <span className="flex items-center gap-2">
                      <UserCheck size={14} />
                      {t("user")} #{supTask.user_id}
                    </span>
                  ) : (
                    t("unassigned")
                  )
                }
                color="green"
                isRTL={isRTL}
              />
              <DetailItem
                icon={Target}
                title={t("parentTask")}
                value={<span className="truncate">{task?.name}</span>}
                color="purple"
                isRTL={isRTL}
              />
            </div>
          </DetailsCard>

          {/* Status Change */}
          <DetailsCard title={t("changeStatus")}>
            <div className="space-y-2">
              <Button
                onClick={() => handleUpdateStatus(0)}
                disabled={updating || supTask?.status === 0}
                variant={supTask?.status === 0 ? "primary" : "secondary"}
                className={`w-full justify-start ${
                  isRTL ? "flex-row-reverse" : ""
                }`}>
                <Clock size={16} className={isRTL ? "ml-2" : "mr-2"} />
                {t("setPending")}
              </Button>
              <Button
                onClick={() => handleUpdateStatus(1)}
                disabled={updating || supTask?.status === 1}
                variant={supTask?.status === 1 ? "primary" : "secondary"}
                className={`w-full justify-start ${
                  isRTL ? "flex-row-reverse" : ""
                }`}>
                <AlertCircle size={16} className={isRTL ? "ml-2" : "mr-2"} />
                {t("setInProgress")}
              </Button>
              <Button
                onClick={() => handleUpdateStatus(2)}
                disabled={updating || supTask?.status === 2}
                variant={supTask?.status === 2 ? "primary" : "secondary"}
                className={`w-full justify-start ${
                  isRTL ? "flex-row-reverse" : ""
                }`}>
                <CheckCircle size={16} className={isRTL ? "ml-2" : "mr-2"} />
                {t("setCompleted")}
              </Button>
            </div>
          </DetailsCard>

          {/* Quick Actions */}
          <DetailsCard title={t("quickActions")}>
            <div className="space-y-2">
              <Button
                onClick={handleEdit}
                variant="secondary"
                className={`w-full justify-start ${
                  isRTL ? "flex-row-reverse" : ""
                }`}>
                <Pencil size={16} className={isRTL ? "ml-2" : "mr-2"} />
                {t("editSupTask")}
              </Button>
              <Button
                onClick={() => setNotesModalOpen(true)}
                variant="secondary"
                className={`w-full justify-start ${
                  isRTL ? "flex-row-reverse" : ""
                }`}>
                <TextAlignCenter
                  size={16}
                  className={isRTL ? "ml-2" : "mr-2"}
                />
                {t("editNotes")}
              </Button>
              <Button
                onClick={fetchSupTaskDetails}
                variant="secondary"
                className={`w-full justify-start ${
                  isRTL ? "flex-row-reverse" : ""
                }`}>
                <RefreshCw size={16} className={isRTL ? "ml-2" : "mr-2"} />
                {t("refresh")}
              </Button>
            </div>
          </DetailsCard>
        </div>
      </div>

      {/* Edit Notes Modal */}
      {notesModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{t("editUserNotes")}</h3>
            <textarea
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              rows={6}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white mb-4"
              placeholder={t("enterUserNotes")}
            />
            <div
              className={`flex justify-end gap-3 ${
                isRTL ? "flex-row-reverse" : ""
              }`}>
              <Button
                onClick={() => setNotesModalOpen(false)}
                variant="secondary">
                {t("cancel")}
              </Button>
              <Button onClick={handleSaveNotes} disabled={updating}>
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
        />
      )}
    </DetailsLayout>
  );
}
