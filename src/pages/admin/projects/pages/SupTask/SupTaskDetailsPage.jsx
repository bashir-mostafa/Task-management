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
  Plus,
  Eye,
  Edit as EditIcon,
  Star,
  TrendingUp,
  Zap,
  ChevronRight,
  PauseCircle,
  AlertTriangle,
  Activity
} from "lucide-react";

import { supTaskService } from "../../services/supTaskService";
import { taskService } from "../../services/taskService";

import DetailsLayout from "../../../../../components/Layout/DetailsLayout";
import DetailsCard from "../../../../../components/UI/DetailsCard";
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
  const [parentTask, setParentTask] = useState(null);
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

  // تعريف الحالات للمهمات الفرعية (0, 1, 2)
  const supTaskStatusConfig = {
    0: {
      label: t("pending"),
      color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border border-gray-200 dark:border-gray-800",
      icon: <Clock size={16} className="text-gray-600 dark:text-gray-400" />,
      variant: "gray",
      description: t("pendingDescription")
    },
    1: {
      label: t("inProgress"),
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
      icon: <AlertCircle size={16} className="text-blue-600 dark:text-blue-400" />,
      variant: "blue",
      description: t("inProgressDescription")
    },
    2: {
      label: t("completed"),
      color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800",
      icon: <CheckCircle size={16} className="text-green-600 dark:text-green-400" />,
      variant: "green",
      description: t("completedDescription")
    }
  };

  // خريطة تحويل حالة المهمة الرئيسية للنص
  const parentTaskStatusText = (status) => {
    const statusMap = {
      'Notimplemented': t("notImplemented"),
      'Underimplementation': t("underImplementation"),
      'Complete': t("completed"),
      'Pause': t("paused")
    };
    return statusMap[status] || t("unknown");
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

      // جلب بيانات المهمة الرئيسية
      const taskData = await taskService.getTaskById(taskId);
      setParentTask(taskData);

      // جلب بيانات المهمة الفرعية
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
    await performStatusUpdate(newStatus);
  };

  const performStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      
      const updatedData = {
        ...supTask,
        status: newStatus,
        completed: newStatus === 2,
        last_updated: new Date().toISOString(),
        ...(newStatus === 2 && {
          completed_at: new Date().toISOString(),
          success_rate: 100 // تعيين نسبة الإنجاز إلى 100% عند الإكمال
        }),
        ...(newStatus === 1 && {
          started_at: supTask.started_at || new Date().toISOString(),
          success_rate: Math.min(supTask.success_rate + 30, 99) // زيادة النسبة عند البدء
        })
      };
      
      await supTaskService.updateSupTask(supTaskId, updatedData);
      
      let message = "";
      switch (newStatus) {
        case 0:
          message = t("statusSetToPending");
          break;
        case 1:
          message = t("statusSetToInProgress");
          break;
        case 2:
          message = t("statusSetToCompleted");
          break;
        default:
          message = t("statusUpdatedSuccessfully");
      }
      
      showToast(message, "success");
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
    navigate(`/projects/${projectId}/tasks/${taskId}/subtasks/${supTaskId}/edit`, {
      state: {
        parentTaskStatus: parentTask?.status,
        currentSupTaskStatus: supTask?.status
      }
    });
  };

  const handleBack = () => {
    navigate(`/projects/${projectId}/tasks/${taskId}/subtasks`);
  };

  const handleViewTaskDetails = () => {
    navigate(`/projects/${projectId}/tasks/${taskId}`);
  };

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

  // التحقق إذا كانت المهمة الرئيسية متوقفة
  const isParentTaskPaused = parentTask?.status === "Pause";
  const isParentTaskCompleted = parentTask?.status === "Complete";

  // إحصائيات التقدم
  const calculateProgressStats = () => {
    if (!supTask) return { progress: 0 };
    
    let progress = supTask.success_rate || 0;
    
    // حساب التقدم التقديري بناءً على الحالة
    if (supTask.status === 2) {
      progress = 100;
    } else if (supTask.status === 1) {
      progress = Math.max(progress, 30); // الحد الأدنى للحالة "قيد التنفيذ"
    }
    
    return { progress };
  };

  const { progress } = calculateProgressStats();

  return (
    <DetailsLayout
      title={supTask?.name}
      subtitle={t("supTaskDetails")}
      id={supTask?.id}
      status={supTask?.status}
      statusColors={supTaskStatusConfig}
      statusIcons={supTaskStatusConfig}
      statusTexts={supTaskStatusConfig}
      loading={loading}
      error={error || (!supTask && !loading ? t("supTaskNotFound") : null)}
      onBack={handleBack}
      backLabel={t("backToSupTasks")}
      isRTL={isRTL}
    >
      {/* معلومات المهمة الرئيسية */}
      {parentTask && (
        <div className={`mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200 dark:border-purple-700/30 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                parentTask.status === 'Complete' ? 'bg-green-100 dark:bg-green-900/30' :
                parentTask.status === 'Underimplementation' ? 'bg-blue-100 dark:bg-blue-900/30' :
                parentTask.status === 'Pause' ? 'bg-orange-100 dark:bg-orange-900/30' :
                'bg-gray-100 dark:bg-gray-800'
              }`}>
                {parentTask.status === 'Complete' ? 
                  <CheckCircle size={20} className="text-green-600 dark:text-green-400" /> :
                  parentTask.status === 'Underimplementation' ? 
                  <Activity size={20} className="text-blue-600 dark:text-blue-400" /> :
                  parentTask.status === 'Pause' ?
                  <PauseCircle size={20} className="text-orange-600 dark:text-orange-400" /> :
                  <Clock size={20} className="text-gray-600 dark:text-gray-400" />
                }
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{parentTask.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t("parentTask")}:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    parentTask.status === 'Complete' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                    parentTask.status === 'Underimplementation' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                    parentTask.status === 'Pause' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                  }`}>
                    {parentTaskStatusText(parentTask.status)}
                  </span>
                </div>
              </div>
            </div>
            <Button
              onClick={handleViewTaskDetails}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Eye size={14} />
              {t("viewTask")}
            </Button>
          </div>
        </div>
      )}

      {/* تنبيه إذا كانت المهمة الرئيسية متوقفة */}
      {isParentTaskPaused && (
        <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-2xl border border-orange-200 dark:border-orange-700/30">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-orange-600 dark:text-orange-400" />
            <div>
              <h3 className="font-semibold text-orange-800 dark:text-orange-300">{t("parentTaskPaused")}</h3>
              <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                {t("parentTaskPausedDescription")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* تنبيه إذا كانت المهمة الرئيسية مكتملة */}
      {isParentTaskCompleted && supTask?.status !== 2 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-700/30">
          <div className="flex items-center gap-3">
            <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-300">{t("parentTaskCompleted")}</h3>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                {t("parentTaskCompletedDescription")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* أزرار التحكم */}
      <div className={`flex flex-wrap gap-3 mb-8 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Button
          onClick={handleViewTaskDetails}
          variant="primary"
          className="flex items-center gap-2 px-5 py-2.5 font-medium rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
        >
          <Eye size={18} />
          {t("viewTask")}
        </Button>
        <Button
          onClick={handleEdit}
          variant="secondary"
          className="flex items-center gap-2 px-5 py-2.5 font-medium rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
        >
          <EditIcon size={18} />
          {t("editSupTask")}
        </Button>
        <Button
          onClick={handleDeleteClick}
          variant="danger"
          className="flex items-center gap-2 px-5 py-2.5 font-medium rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
        >
          <Trash2 size={18} />
          {t("deleteSupTask")}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* العمود الأيسر */}
        <div className="lg:col-span-2 space-y-6">
          {/* الوصف */}
          <DetailsCard 
            title={t("description")} 
            icon={FileText}
          >
            <div className="prose dark:prose-invert max-w-none p-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                {supTask?.description || t("noDescription")}
              </p>
            </div>
          </DetailsCard>

          {/* ملاحظات المستخدم */}
          <DetailsCard
            title={t("userNotes")}
            icon={TextAlignCenter}
            actions={
              <Button
                onClick={() => setNotesModalOpen(true)}
                variant="secondary"
                size="sm"
                className={`flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white`}
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
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TextAlignCenter size={24} className="text-gray-400 dark:text-gray-500" />
                </div>
                <p className="mb-4">{t("noUserNotes")}</p>
                <Button
                  onClick={() => setNotesModalOpen(true)}
                  variant="secondary"
                  className={`flex items-center gap-2 mx-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white`}
                >
                  <Plus size={16} />
                  {t("addNotes")}
                </Button>
              </div>
            )}
          </DetailsCard>
        </div>

        {/* العمود الأيمن */}
        <div className="space-y-6">
          {/* تفاصيل المهمة الفرعية */}
          <DetailsCard 
            title={t("supTaskDetails")}
            icon={Target}
          >
            <div className="space-y-4 p-4">
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
              />
              
              {supTask?.completed_at && (
                <DetailItem
                  icon={CheckCircle}
                  title={t("completedAt")}
                  value={
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(supTask.completed_at).toLocaleString()}
                    </span>
                  }
                  color="green"
                  isRTL={isRTL}
                />
              )}
            </div>
          </DetailsCard>

          {/* تغيير الحالة */}
          <DetailsCard 
            title={t("changeStatus")}
            icon={Activity}
          >
            <div className="space-y-3 p-4">
              <Button
                onClick={() => handleUpdateStatus(0)}
                disabled={updating || supTask?.status === 0 || isParentTaskCompleted}
                variant={supTask?.status === 0 ? "primary" : "secondary"}
                className={`w-full justify-start py-3 ${
                  supTask?.status === 0 
                  ? 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white' 
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Clock size={18} className="mr-3" />
                {t("setPending")}
                {isParentTaskCompleted && supTask?.status !== 0 && (
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-0.5 rounded ml-2">
                    {t("locked")}
                  </span>
                )}
              </Button>
              
              <Button
                onClick={() => handleUpdateStatus(1)}
                disabled={updating || supTask?.status === 1 || isParentTaskPaused || isParentTaskCompleted}
                variant={supTask?.status === 1 ? "primary" : "secondary"}
                className={`w-full justify-start py-3 ${
                  supTask?.status === 1 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white' 
                  : 'bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-300'
                }`}
              >
                <AlertCircle size={18} className="mr-3" />
                {t("setInProgress")}
                {(isParentTaskPaused || isParentTaskCompleted) && supTask?.status !== 1 && (
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-0.5 rounded ml-2">
                    {t("locked")}
                  </span>
                )}
              </Button>
              
              <Button
                onClick={() => handleUpdateStatus(2)}
                disabled={updating || supTask?.status === 2 || isParentTaskPaused}
                variant={supTask?.status === 2 ? "primary" : "secondary"}
                className={`w-full justify-start py-3 ${
                  supTask?.status === 2 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white' 
                  : 'bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-800/30 text-green-700 dark:text-green-300'
                }`}
              >
                <CheckCircle size={18} className="mr-3" />
                {t("setCompleted")}
                {isParentTaskPaused && supTask?.status !== 2 && (
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-0.5 rounded ml-2">
                    {t("locked")}
                  </span>
                )}
              </Button>
            </div>
          </DetailsCard>

          {/* إحصائيات التقدم */}
          <DetailsCard
            title={t("progressStatistics")}
            icon={TrendingUp}
          >
            <div className="space-y-5 p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("progress")}</span>
                  <span className="text-xl font-bold text-primary bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                    {progress}%
                  </span>
                </div>
                <ProgressBar
                  value={progress}
                  height="h-3"
                  color={
                    supTask?.status === 2 ? 'green' :
                    supTask?.status === 1 ? 'blue' : 'gray'
                  }
                  animated
                  gradient
                />
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("currentStatus")}</span>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${
                    supTaskStatusConfig[supTask?.status]?.color || supTaskStatusConfig[0].color
                  }`}>
                    {supTaskStatusConfig[supTask?.status]?.icon}
                    {supTaskStatusConfig[supTask?.status]?.label || t("pending")}
                  </span>
                </div>
              </div>
            </div>
          </DetailsCard>

          {/* Quick Actions */}
          <DetailsCard 
            title={t("quickActions")}
            icon={Zap}
          >
            <div className="space-y-2 p-4">
              <Button
                onClick={handleEdit}
                variant="secondary"
                className={`w-full justify-start py-3 text-left bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30 border border-blue-200/50 dark:border-blue-700/30`}
              >
                <Pencil size={18} className="mr-3" />
                {t("editSupTask")}
              </Button>
              <Button
                onClick={() => setNotesModalOpen(true)}
                variant="secondary"
                className={`w-full justify-start py-3 text-left bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-800/30 dark:hover:to-purple-700/30 border border-purple-200/50 dark:border-purple-700/30`}
              >
                <TextAlignCenter size={18} className="mr-3" />
                {t("editNotes")}
              </Button>
              <Button
                onClick={fetchSupTaskDetails}
                variant="secondary"
                className={`w-full justify-start py-3 text-left bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 hover:from-green-100 hover:to-green-200 dark:hover:from-green-800/30 dark:hover:to-green-700/30 border border-green-200/50 dark:border-green-700/30`}
              >
                <RefreshCw size={18} className="mr-3" />
                {t("refresh")}
              </Button>
              <Button
                onClick={handleViewTaskDetails}
                variant="secondary"
                className={`w-full justify-start py-3 text-left bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 hover:from-yellow-100 hover:to-yellow-200 dark:hover:from-yellow-800/30 dark:hover:to-yellow-700/30 border border-yellow-200/50 dark:border-yellow-700/30`}
              >
                <Eye size={18} className="mr-3" />
                {t("viewParentTask")}
              </Button>
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
            <div className="flex justify-end gap-3">
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