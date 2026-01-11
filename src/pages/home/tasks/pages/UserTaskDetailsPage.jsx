// src/pages/admin/projects/pages/UserTaskDetailsPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Calendar,
  User,
  BarChart3,
  ListTodo,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  Download,
  MessageSquare,
  Upload,
  Edit,
  Paperclip,
  Target,
  Flag,
  Bell,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Layers,
  Send,
  Star,
  StarHalf,
  Star as StarEmpty,
} from "lucide-react";

import { taskUserService } from "../services/taskUserService";
import { supTaskService } from "../services/supTaskService";

import DetailsLayout from "../../../../components/Layout/DetailsLayout";
import DetailsCard from "../../../../components/UI/DetailsCard";
import ProgressBar from "../../../../components/UI/ProgressBar";
import DetailItem from "../../../../components/UI/DetailItem";
import ButtonHero from "../../../../components/UI/ButtonHero";
import Toast from "../../../../components/Toast";
import CommentSection from "../../../../components/UI/CommentSection";
import FileUpload from "../../../../components/UI/FileUpload";

export default function UserTaskDetailsPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [task, setTask] = useState(null);
  const [supTasks, setSupTasks] = useState([]);
  const [userTaskInfo, setUserTaskInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [supTasksLoading, setSupTasksLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRTL] = useState(i18n.language === "ar");

  // States for task updates
  const [comments, setComments] = useState([]);
  const [files, setFiles] = useState([]);
  
  // States for UserTask API
  const [userNotes, setUserNotes] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [evaluation, setEvaluation] = useState(0);
  const [updatingUserTask, setUpdatingUserTask] = useState(false);

  // States for sub-tasks
  const [expandedSupTask, setExpandedSupTask] = useState(null);
  const [supTaskUserNotes, setSupTaskUserNotes] = useState({});
  const [updatingSupTask, setUpdatingSupTask] = useState(null);

  // States for comments with status
  const [newComment, setNewComment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [addingComment, setAddingComment] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Task status colors
  const statusColors = {
    Underimplementation: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800",
    Complete: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800",
    Notimplemented: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800",
    Pause: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800",
    Pending: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
  };

  const statusIcons = {
    Underimplementation: <BarChart3 size={16} className="text-yellow-600 dark:text-yellow-400" />,
    Complete: <CheckCircle size={16} className="text-green-600 dark:text-green-400" />,
    Notimplemented: <AlertCircle size={16} className="text-red-600 dark:text-red-400" />,
    Pause: <Clock size={16} className="text-orange-600 dark:text-orange-400" />,
    Pending: <Clock size={16} className="text-blue-600 dark:text-blue-400" />,
  };

  const getStatusText = useCallback((status) => {
    switch (status) {
      case "Underimplementation":
        return t("inProgress");
      case "Complete":
        return t("complete");
      case "Notimplemented":
        return t("notImplemented");
      case "Pause":
        return t("pause");
      case "Pending":
        return t("pending");
      default:
        return t("unknown");
    }
  }, [t]);

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  const fetchTaskDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch main task details
      const taskData = await taskUserService.getTaskById(taskId);
      setTask(taskData);

      // Fetch user task info
      const userTaskInfoData = await taskUserService.getUserTaskInfo(taskId);
      setUserTaskInfo(userTaskInfoData);
      
      // Initialize states from user task info
      setUserNotes(userTaskInfoData?.notes || "");
      setIsCompleted(userTaskInfoData?.completed || false);
      setEvaluation(userTaskInfoData?.evaluations || 0);

      // Fetch sub-tasks
      await fetchSupTasks();

      // Fetch comments if available
      try {
        const commentsData = await taskUserService.getComments(taskId);
        setComments(commentsData || []);
      } catch (commentsError) {
        console.error("Error fetching comments:", commentsError);
      }

      // Fetch files if available
      try {
        const filesData = await taskUserService.getFiles(taskId);
        setFiles(filesData || []);
      } catch (filesError) {
        console.error("Error fetching files:", filesError);
      }

    } catch (error) {
      const errorMessage = error.response?.data?.message || t("fetchError");
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [taskId, t, showToast]);

  const fetchSupTasks = async () => {
    try {
      setSupTasksLoading(true);
      const response = await supTaskService.getAllSupTasks({
        Ttaskid: taskId,
        pageNumber: 1,
        pageSize: 100
      });
      
      setSupTasks(response.data || []);
      
      const initialNotes = {};
      response.data?.forEach(supTask => {
        initialNotes[supTask.id] = supTask.user_notes || "";
      });
      setSupTaskUserNotes(initialNotes);
      
    } catch (error) {
      console.error("Error fetching sub-tasks:", error);
      showToast(t("errorFetchingSubTasks"), "error");
    } finally {
      setSupTasksLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) fetchTaskDetails();
  }, [taskId, fetchTaskDetails]);

  const handleBack = useCallback(
    () => navigate("/home/tasks"),
    [navigate]
  );

  // تحديث معلومات UserTask
  const handleUpdateUserTask = async () => {
    try {
      setUpdatingUserTask(true);
      
      const data = {
        completed: isCompleted,
        notes: userNotes,
        evaluations: evaluation
      };
      
      await taskUserService.updateUserTask(taskId, data);
      showToast(t("userTaskUpdatedSuccessfully"), "success");
      
      // Refresh user task info
      const userTaskInfoData = await taskUserService.getUserTaskInfo(taskId);
      setUserTaskInfo(userTaskInfoData);
      
    } catch (error) {
      showToast(error.response?.data?.message || t("updateError"), "error");
    } finally {
      setUpdatingUserTask(false);
    }
  };

  // إرسال تعليق مع الحالة
  const handleAddCommentWithStatus = async () => {
    if (!newComment.trim()) return;
    
    try {
      setAddingComment(true);
      
      // إرسال التعليق مع الحالة إذا كانت محددة
      if (selectedStatus) {
        await taskUserService.addCommentWithStatus(taskId, newComment, selectedStatus);
        showToast(t("commentWithStatusAddedSuccessfully"), "success");
      } else {
        // إرسال تعليق عادي
        await taskUserService.addComment(taskId, newComment);
        showToast(t("commentAddedSuccessfully"), "success");
      }
      
      // Reset fields
      setNewComment("");
      setSelectedStatus(null);
      
      // Refresh comments
      const commentsData = await taskUserService.getComments(taskId);
      setComments(commentsData || []);
      
    } catch (error) {
      showToast(error.response?.data?.message || t("commentError"), "error");
    } finally {
      setAddingComment(false);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      await taskUserService.uploadFile(taskId, file);
      showToast(t("fileUploadedSuccessfully"), "success");
      fetchTaskDetails();
    } catch (error) {
      showToast(error.response?.data?.message || t("uploadError"), "error");
    }
  };

  // تحديث ملاحظات المهمة الفرعية
  const handleUpdateSupTaskNotes = async (supTaskId) => {
    try {
      setUpdatingSupTask(supTaskId);
      
      await supTaskService.updateSupTaskUserNotes(supTaskId, supTaskUserNotes[supTaskId] || "");
      showToast(t("subTaskNotesUpdatedSuccessfully"), "success");
      
      // Refresh sup tasks
      const response = await supTaskService.getAllSupTasks({
        Ttaskid: taskId,
        pageNumber: 1,
        pageSize: 100
      });
      setSupTasks(response.data || []);
      
    } catch (error) {
      showToast(error.response?.data?.message || t("updateError"), "error");
    } finally {
      setUpdatingSupTask(null);
    }
  };

  // تحديث حالة المهمة الفرعية
  const handleUpdateSupTaskStatus = async (supTaskId, status) => {
    try {
      await supTaskService.updateSupTaskStatus(supTaskId, status);
      showToast(t("subTaskStatusUpdatedSuccessfully"), "success");
      
      // Refresh sup tasks
      const response = await supTaskService.getAllSupTasks({
        Ttaskid: taskId,
        pageNumber: 1,
        pageSize: 100
      });
      setSupTasks(response.data || []);
      
    } catch (error) {
      showToast(error.response?.data?.message || t("updateError"), "error");
    }
  };

  // تعيين المهمة الفرعية كمكتملة
  const handleCompleteSupTask = async (supTaskId) => {
    try {
      const userNotes = supTaskUserNotes[supTaskId] || "";
      await supTaskService.completeSupTask(supTaskId, userNotes);
      showToast(t("subTaskMarkedAsCompleted"), "success");
      
      // Refresh sup tasks
      const response = await supTaskService.getAllSupTasks({
        Ttaskid: taskId,
        pageNumber: 1,
        pageSize: 100
      });
      setSupTasks(response.data || []);
      
    } catch (error) {
      showToast(error.response?.data?.message || t("updateError"), "error");
    }
  };

  const toggleSupTaskExpansion = (supTaskId) => {
    setExpandedSupTask(expandedSupTask === supTaskId ? null : supTaskId);
  };

  const taskStatus = task?.status || "Pending";
  const translatedStatus = getStatusText(taskStatus);

  // Calculate time progress
  const timeProgress = useMemo(() => {
    if (!task || !task.start_date || !task.end_date) return 0;
    const start = new Date(task.start_date);
    const end = new Date(task.end_date);
    const now = new Date();
    if (now >= end) return 100;
    if (now <= start) return 0;
    const totalDuration = end - start;
    const elapsed = now - start;
    return Math.min(Math.round((elapsed / totalDuration) * 100), 100);
  }, [task]);

  // Check if task is overdue
  const isOverdue = useMemo(() => {
    if (!task?.end_date) return false;
    const endDate = new Date(task.end_date);
    const now = new Date();
    return now > endDate && taskStatus !== "Complete";
  }, [task, taskStatus]);

  // Format dates
  const formattedStartDate = task?.start_date 
    ? new Date(task.start_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : t("notSet");

  const formattedEndDate = task?.end_date 
    ? new Date(task.end_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : t("notSet");

  const formattedCreatedDate = task?.createdAt 
    ? new Date(task.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : t("unknown");

  // إحصائيات المهام الفرعية
  const supTasksStats = useMemo(() => {
    const total = supTasks.length;
    const completed = supTasks.filter(t => t.status === "Complete").length;
    const inProgress = supTasks.filter(t => t.status === "Underimplementation").length;
    const pending = supTasks.filter(t => t.status === "Pending").length;
    const paused = supTasks.filter(t => t.status === "Pause").length;
    const notImplemented = supTasks.filter(t => t.status === "Notimplemented").length;
    
    const overdue = supTasks.filter(t => {
      if (!t.end_date) return false;
      const endDate = new Date(t.end_date);
      const now = new Date();
      return now > endDate && t.status !== "Complete";
    }).length;
    
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      total,
      completed,
      inProgress,
      pending,
      paused,
      notImplemented,
      overdue,
      completionPercentage
    };
  }, [supTasks]);

  // Star rating component
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= evaluation) {
        stars.push(
          <Star
            key={i}
            size={24}
            className="text-yellow-500 fill-yellow-500 cursor-pointer"
            onClick={() => setEvaluation(i)}
          />
        );
      } else {
        stars.push(
          <StarEmpty
            key={i}
            size={24}
            className="text-gray-300 dark:text-gray-600 cursor-pointer hover:text-yellow-500"
            onClick={() => setEvaluation(i)}
          />
        );
      }
    }
    return stars;
  };

  return (
    <DetailsLayout
      title={task?.name || t("taskDetails")}
      subtitle={t("taskDetailsDescription")}
      id={task?.id}
      loading={loading}
      error={error || (!task && !loading ? t("taskNotFound") : null)}
      onBack={handleBack}
      backLabel={t("backToTasks")}
      isRTL={isRTL}>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Task Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Description Card */}
          <DetailsCard 
            title={t("taskDescription")} 
            icon={FileText}
            actions={
              <div className="flex gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
                    statusColors[taskStatus] || statusColors.Pending
                  }`}>
                  {statusIcons[taskStatus] || statusIcons.Pending}
                  {translatedStatus}
                </span>
              </div>
            }>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {task?.description || t("noDescription")}
              </p>
              
              {task?.notesadmin && (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                    {t("adminNotes")}
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    {task.notesadmin}
                  </p>
                </div>
              )}
            </div>
          </DetailsCard>

          {/* User Task Update Card */}
          <DetailsCard 
            title={t("yourTaskProgress")} 
            icon={User}>
            <div className="space-y-6">
              {/* Completion Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-600 dark:text-green-400" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {t("markAsCompleted")}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={(e) => setIsCompleted(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                </label>
              </div>

              {/* Evaluation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t("evaluation")}
                </label>
                <div className="flex items-center gap-2">
                  {renderStars()}
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    {evaluation}/5
                  </span>
                </div>
              </div>

              {/* User Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("yourNotes")}
                </label>
                <textarea
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("addYourNotesHere")}
                />
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <ButtonHero
                  onClick={handleUpdateUserTask}
                  variant="primary"
                  isRTL={isRTL}
                  icon={Check}
                  iconPosition={isRTL ? "right" : "left"}
                  className="w-full"
                  disabled={updatingUserTask}>
                  {updatingUserTask ? t("saving") : t("saveProgress")}
                </ButtonHero>
              </div>
            </div>
          </DetailsCard>

          {/* Sub-Tasks Card */}
          <DetailsCard 
            title={t("subTasks")} 
            icon={Layers}
            actions={
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t("completed")}: {supTasksStats.completed}/{supTasksStats.total}
                </span>
              </div>
            }>
            <div className="space-y-4">
              {/* Sub-tasks statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {supTasksStats.total}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {t("total")}
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    {supTasksStats.completed}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {t("completed")}
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                    {supTasksStats.inProgress}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {t("inProgress")}
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-red-600 dark:text-red-400">
                    {supTasksStats.overdue}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {t("overdue")}
                  </div>
                </div>
              </div>

              {/* Progress bar for sub-tasks */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("subTasksCompletion")}
                  </span>
                  <span className="text-sm font-bold text-gray-800 dark:text-white">
                    {supTasksStats.completionPercentage}%
                  </span>
                </div>
                <ProgressBar
                  value={supTasksStats.completionPercentage}
                  height="h-3"
                  color={
                    supTasksStats.completionPercentage >= 80 ? "green" : 
                    supTasksStats.completionPercentage >= 50 ? "yellow" : "blue"
                  }
                />
              </div>

              {/* Sub-tasks list */}
              {supTasksLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {t("loadingSubTasks")}
                  </p>
                </div>
              ) : supTasks.length > 0 ? (
                <div className="space-y-3">
                  {supTasks.map((supTask) => {
                    const isExpanded = expandedSupTask === supTask.id;
                    const isOverdueSubTask = supTask.end_date && 
                      new Date(supTask.end_date) < new Date() && 
                      supTask.status !== "Complete";
                    
                    return (
                      <div
                        key={supTask.id}
                        className={`bg-white dark:bg-gray-800 rounded-lg border ${
                          isOverdueSubTask 
                            ? 'border-red-300 dark:border-red-800' 
                            : 'border-gray-200 dark:border-gray-700'
                        } overflow-hidden`}>
                        
                        {/* Sub-task header */}
                        <div 
                          className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50"
                          onClick={() => toggleSupTaskExpansion(supTask.id)}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="flex-shrink-0">
                                <ListTodo size={18} className="text-gray-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                  {supTask.name}
                                </h4>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                                    statusColors[supTask.status] || statusColors.Pending
                                  }`}>
                                    {statusIcons[supTask.status] || statusIcons.Pending}
                                    {getStatusText(supTask.status)}
                                  </span>
                                  
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {supTask.start_date && new Date(supTask.start_date).toLocaleDateString()}
                                  </span>
                                  
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {t("to")}
                                  </span>
                                  
                                  <span className={`text-xs ${
                                    isOverdueSubTask 
                                      ? 'text-red-600 dark:text-red-400 font-semibold' 
                                      : 'text-gray-500 dark:text-gray-400'
                                  }`}>
                                    {supTask.end_date && new Date(supTask.end_date).toLocaleDateString()}
                                  </span>
                                  
                                  {isOverdueSubTask && (
                                    <span className="text-xs text-red-600 dark:text-red-400 font-semibold">
                                      ({t("overdue")})
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronUp size={20} className="text-gray-400" />
                              ) : (
                                <ChevronDown size={20} className="text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Expanded content */}
                        {isExpanded && (
                          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/30">
                            <div className="space-y-4">
                              {/* Description */}
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  {t("description")}
                                </h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {supTask.description || t("noDescription")}
                                </p>
                              </div>
                              
                              {/* Assigned user */}
                              {supTask.user && (
                                <div>
                                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t("assignedTo")}
                                  </h5>
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                        {supTask.user.username?.charAt(0)?.toUpperCase() || "U"}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {supTask.user.username}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {supTask.user.email}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* User notes (editable) */}
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t("yourNotes")}
                                  </h5>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleCompleteSupTask(supTask.id)}
                                      className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                                      title={t("markAsCompleted")}
                                      disabled={supTask.status === "Complete"}>
                                      <Check size={16} />
                                    </button>
                                  </div>
                                </div>
                                
                                <textarea
                                  value={supTaskUserNotes[supTask.id] || ""}
                                  onChange={(e) => setSupTaskUserNotes(prev => ({
                                    ...prev,
                                    [supTask.id]: e.target.value
                                  }))}
                                  rows="3"
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                  placeholder={t("addNotesForSubTask")}
                                />
                                
                                {/* Status Quick Actions for Sub-Task */}
                                <div className="mt-3">
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    {t("updateStatus")}:
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {["Underimplementation", "Complete", "Notimplemented", "Pause"].map(status => (
                                      <button
                                        key={status}
                                        onClick={() => handleUpdateSupTaskStatus(supTask.id, status)}
                                        className={`px-2 py-1 rounded text-xs font-medium ${
                                          supTask.status === status
                                            ? statusColors[status]
                                            : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                        }`}>
                                        {getStatusText(status)}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="flex justify-end gap-2 mt-2">
                                  <ButtonHero
                                    onClick={() => handleUpdateSupTaskNotes(supTask.id)}
                                    variant="primary"
                                    size="xs"
                                    disabled={updatingSupTask === supTask.id}
                                    isRTL={isRTL}>
                                    {updatingSupTask === supTask.id ? t("saving") : t("saveNotes")}
                                  </ButtonHero>
                                </div>
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
                  <Layers className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    {t("noSubTasks")}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t("noSubTasksForThisTask")}
                  </p>
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
            icon={FileText}>
            <div className="space-y-4">
              <DetailItem
                icon={Flag}
                title={t("taskID")}
                value={`#${task?.id}`}
                color="purple"
                isRTL={isRTL}
              />
              
              
              
              <DetailItem
                icon={Calendar}
                title={t("startDate")}
                value={formattedStartDate}
                color="green"
                isRTL={isRTL}
              />
              
              <DetailItem
                icon={Calendar}
                title={t("endDate")}
                value={formattedEndDate}
                color={isOverdue ? "red" : "orange"}
                isRTL={isRTL}
              />
           
              
          
            </div>
          </DetailsCard>

          {/* Progress Tracking Card */}
          <DetailsCard 
            title={t("progressTracking")} 
            icon={BarChart3}>
            <div className="space-y-6">
              {/* Main Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("taskCompletion")}
                  </span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {task?.success_rate || 0}%
                  </span>
                </div>
                <ProgressBar
                  value={task?.success_rate || 0}
                  height="h-4"
                  color={
                    taskStatus === "Complete" ? "green" : 
                    taskStatus === "Underimplementation" ? "yellow" :
                    taskStatus === "Pause" ? "orange" :
                    taskStatus === "Notimplemented" ? "red" : "blue"
                  }
                />
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
                    <span>{formattedStartDate}</span>
                    <span>{formattedEndDate}</span>
                  </div>
                  {isOverdue && (
                    <div className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle size={14} />
                      <span>{t("taskOverdue")}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DetailsCard>

          {/* Sub-tasks Summary Card */}
          <DetailsCard 
            title={t("subTasksSummary")} 
            icon={Layers}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t("totalSubTasks")}
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {supTasksStats.total}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t("completed")}
                </span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {supTasksStats.completed}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t("inProgress")}
                </span>
                <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  {supTasksStats.inProgress}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t("overdue")}
                </span>
                <span className="text-lg font-bold text-red-600 dark:text-red-400">
                  {supTasksStats.overdue}
                </span>
              </div>
              
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("completionRate")}
                  </span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {supTasksStats.completionPercentage}%
                  </span>
                </div>
                <ProgressBar
                  value={supTasksStats.completionPercentage}
                  height="h-2"
                  className="mt-2"
                />
              </div>
            </div>
          </DetailsCard>

          {/* User Task Info Card */}
          <DetailsCard 
            title={t("yourStatus")} 
            icon={User}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t("completionStatus")}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isCompleted 
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" 
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                }`}>
                  {isCompleted ? t("completed") : t("inProgress")}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t("yourEvaluation")}
                </span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    i < evaluation ? (
                      <Star key={i} size={16} className="text-yellow-500 fill-yellow-500" />
                    ) : (
                      <StarEmpty key={i} size={16} className="text-gray-300 dark:text-gray-600" />
                    )
                  ))}
                </div>
              </div>
              
              {userTaskInfo?.notes && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t("yourNotes")}:
                  </p>
                  <p className="text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
                    {userTaskInfo.notes}
                  </p>
                </div>
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