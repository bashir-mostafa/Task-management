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
  Trash2,
  Paperclip,
  Users,
  Target,
  Flag,
  Bell,
  Share2,
} from "lucide-react";

import { taskUserService } from "../services/taskUserService";

import DetailsLayout from "../../../../components/Layout/DetailsLayout";
import DetailsCard from "../../../../components/UI/DetailsCard";
import ProgressBar from "../../../../components/UI/ProgressBar";
import DetailItem from "../../../../components/UI/DetailItem";
import ButtonHero from "../../../../components/UI/ButtonHero";
import Toast from "../../../../components/Toast";
import CommentSection from "../../../../components/UI/CommentSection"; // إذا كان لديك مكون
import FileUpload from "../../../../components/UI/FileUpload"; // إذا كان لديك مكون

export default function UserTaskDetailsPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRTL] = useState(i18n.language === "ar");

  // States for task updates
  const [comments, setComments] = useState([]);
  const [files, setFiles] = useState([]);
  const [showUpdateProgress, setShowUpdateProgress] = useState(false);
  const [newProgress, setNewProgress] = useState(0);
  const [progressNotes, setProgressNotes] = useState("");

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Task status colors
  const statusColors = {
    1: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
    2: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800",
    3: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800",
    4: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800",
    5: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800",
  };

  const statusIcons = {
    1: <Clock size={16} className="text-blue-600 dark:text-blue-400" />,
    2: <BarChart3 size={16} className="text-yellow-600 dark:text-yellow-400" />,
    3: <CheckCircle size={16} className="text-green-600 dark:text-green-400" />,
    4: <Clock size={16} className="text-orange-600 dark:text-orange-400" />,
    5: <AlertCircle size={16} className="text-red-600 dark:text-red-400" />,
  };

  const getStatusText = useCallback((status) => {
    switch (status) {
      case 1:
        return t("planning");
      case 2:
        return t("inProgress");
      case 3:
        return t("completed");
      case 4:
        return t("paused");
      case 5:
        return t("notImplemented");
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

      const taskData = await taskUserService.getTaskById(taskId);
      setTask(taskData);

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

  useEffect(() => {
    if (taskId) fetchTaskDetails();
  }, [taskId, fetchTaskDetails]);

  const handleBack = useCallback(
    () => navigate("/home/tasks"),
    [navigate]
  );

  const handleUpdateProgress = async () => {
    try {
      await taskUserService.updateProgress(taskId, newProgress, progressNotes);
      showToast(t("progressUpdatedSuccessfully"), "success");
      setShowUpdateProgress(false);
      setNewProgress(0);
      setProgressNotes("");
      fetchTaskDetails(); // Refresh task data
    } catch (error) {
      showToast(error.response?.data?.message || t("updateError"), "error");
    }
  };

  const handleAddComment = async (commentText) => {
    try {
      await taskUserService.addComment(taskId, commentText);
      showToast(t("commentAddedSuccessfully"), "success");
      fetchTaskDetails(); // Refresh comments
    } catch (error) {
      showToast(error.response?.data?.message || t("commentError"), "error");
    }
  };

  const handleFileUpload = async (file) => {
    try {
      await taskUserService.uploadFile(taskId, file);
      showToast(t("fileUploadedSuccessfully"), "success");
      fetchTaskDetails(); // Refresh files
    } catch (error) {
      showToast(error.response?.data?.message || t("uploadError"), "error");
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await taskUserService.updateTaskStatus(taskId, newStatus);
      showToast(t("statusUpdatedSuccessfully"), "success");
      fetchTaskDetails(); // Refresh task data
    } catch (error) {
      showToast(error.response?.data?.message || t("statusError"), "error");
    }
  };

  const taskStatus = task?.status || 1;
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
    return now > endDate && taskStatus !== 3; // Not completed and overdue
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

  // Status options for dropdown
  const statusOptions = [
    { value: 1, label: t("planning"), disabled: taskStatus === 1 },
    { value: 2, label: t("inProgress"), disabled: taskStatus === 2 },
    { value: 3, label: t("completed"), disabled: taskStatus === 3 },
    { value: 4, label: t("paused"), disabled: taskStatus === 4 },
    { value: 5, label: t("notImplemented"), disabled: taskStatus === 5 },
  ];

  return (
    <DetailsLayout
      title={task?.name || t("taskDetails")}
      subtitle={t("taskDetailsDescription")}
      id={task?.id}
      loading={loading}
      error={error || (!task && !loading ? t("taskNotFound") : null)}
      onBack={handleBack}
      backLabel={t("backToTasks")}
      isRTL={isRTL}
      actions={
        <div className="flex gap-2">
          <ButtonHero
            onClick={() => setShowUpdateProgress(true)}
            variant="primary"
            size="sm"
            isRTL={isRTL}
            icon={Edit}
            iconPosition={isRTL ? "right" : "left"}>
            {t("updateProgress")}
          </ButtonHero>
        </div>
      }>
      
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
                    statusColors[taskStatus] || statusColors[1]
                  }`}>
                  {statusIcons[taskStatus] || statusIcons[1]}
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

          {/* Progress Card */}
          <DetailsCard 
            title={t("progressTracking")} 
            icon={BarChart3}>
            <div className="space-y-6">
              {/* Main Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("completionProgress")}
                  </span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {task?.success_rate || 0}%
                  </span>
                </div>
                <ProgressBar
                  value={task?.success_rate || 0}
                  height="h-4"
                  color={
                    taskStatus === 3 ? "green" : 
                    taskStatus === 2 ? "yellow" :
                    taskStatus === 4 ? "orange" :
                    taskStatus === 5 ? "red" : "blue"
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

              {/* Update Progress Button */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <ButtonHero
                  onClick={() => setShowUpdateProgress(true)}
                  variant="primary"
                  isRTL={isRTL}
                  icon={Edit}
                  iconPosition={isRTL ? "right" : "left"}
                  className="w-full">
                  {t("updateProgress")}
                </ButtonHero>
              </div>
            </div>
          </DetailsCard>

          {/* Files Card */}
          <DetailsCard 
            title={t("attachments")} 
            icon={Paperclip}
            actions={
              <FileUpload
                onFileSelect={handleFileUpload}
                accept="*/*"
                maxSize={10 * 1024 * 1024} // 10MB
                buttonText={t("uploadFile")}
                buttonVariant="outline"
                isRTL={isRTL}
              />
            }>
            {files.length > 0 ? (
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {file.name || `File ${index + 1}`}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {file.size ? `${(file.size / 1024).toFixed(2)} KB` : ''}
                          {file.uploadedAt && ` • ${new Date(file.uploadedAt).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => window.open(file.url, '_blank')}
                      className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                      title={t("download")}>
                      <Download size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Paperclip className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  {t("noFiles")}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t("uploadFilesHere")}
                </p>
              </div>
            )}
          </DetailsCard>

          {/* Comments Card */}
          <DetailsCard 
            title={t("comments")} 
            icon={MessageSquare}>
            <CommentSection
              comments={comments}
              onAddComment={handleAddComment}
              currentUserId="current" // يجب تمرير ID المستخدم الحالي
              isRTL={isRTL}
            />
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
                title={t("createdAt")}
                value={formattedCreatedDate}
                color="blue"
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
              
              <DetailItem
                icon={User}
                title={t("createdBy")}
                value={task?.create_by || t("unknown")}
                color="indigo"
                isRTL={isRTL}
              />
              
              <DetailItem
                icon={Target}
                title={t("priority")}
                value={task?.priority || t("normal")}
                color={task?.priority === "high" ? "red" : task?.priority === "medium" ? "yellow" : "green"}
                isRTL={isRTL}
              />
            </div>
          </DetailsCard>

          {/* Quick Actions Card */}
          <DetailsCard 
            title={t("quickActions")} 
            icon={Bell}>
            <div className="space-y-3">
              <ButtonHero
                onClick={() => setShowUpdateProgress(true)}
                variant="primary"
                isRTL={isRTL}
                icon={Edit}
                iconPosition={isRTL ? "right" : "left"}
                className="w-full">
                {t("updateProgress")}
              </ButtonHero>
              
              <ButtonHero
                onClick={() => handleStatusChange(3)}
                variant="success"
                isRTL={isRTL}
                icon={CheckCircle}
                iconPosition={isRTL ? "right" : "left"}
                className="w-full"
                disabled={taskStatus === 3}>
                {t("markAsCompleted")}
              </ButtonHero>
              
              <div className="grid grid-cols-2 gap-2">
                <ButtonHero
                  onClick={() => handleStatusChange(4)}
                  variant="warning"
                  size="sm"
                  isRTL={isRTL}
                  icon={Clock}
                  iconPosition={isRTL ? "right" : "left"}
                  className="w-full"
                  disabled={taskStatus === 4}>
                  {t("pause")}
                </ButtonHero>
                
                <ButtonHero
                  onClick={() => handleStatusChange(2)}
                  variant="info"
                  size="sm"
                  isRTL={isRTL}
                  icon={BarChart3}
                  iconPosition={isRTL ? "right" : "left"}
                  className="w-full"
                  disabled={taskStatus === 2}>
                  {t("resume")}
                </ButtonHero>
              </div>
            </div>
          </DetailsCard>

          {/* Status History Card (يمكن إضافتها لاحقاً) */}
          <DetailsCard 
            title={t("statusHistory")} 
            icon={Clock}>
            <div className="space-y-3">
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("statusHistoryComingSoon")}
                </p>
              </div>
            </div>
          </DetailsCard>
        </div>
      </div>

      {/* Update Progress Modal */}
      {showUpdateProgress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t("updateProgress")}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("progress")} ({newProgress}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newProgress}
                  onChange={(e) => setNewProgress(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("notes")}
                </label>
                <textarea
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t("progressNotesPlaceholder")}
                />
              </div>
              
              <div className="flex gap-2 pt-2">
                <ButtonHero
                  onClick={() => setShowUpdateProgress(false)}
                  variant="secondary"
                  className="flex-1">
                  {t("cancel")}
                </ButtonHero>
                <ButtonHero
                  onClick={handleUpdateProgress}
                  variant="primary"
                  className="flex-1"
                  disabled={!newProgress}>
                  {t("save")}
                </ButtonHero>
              </div>
            </div>
          </div>
        </div>
      )}

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