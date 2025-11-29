// src/pages/admin/projects/pages/TaskDetailsPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Edit,
  Calendar,
  User,
  Target,
  FileText,
  BarChart3,
  Clock,
  CheckCircle,
  Users,
} from "lucide-react";
import { taskService } from "../../services/taskService";
import useDarkMode from "../../../../../hooks/useDarkMode";
import Button from "../../../../../components/UI/Button";

export default function TaskDetailsPage() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isDark } = useDarkMode();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isRTL = i18n.language === "ar";

  const taskStatusColors = {
    0: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    1: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    2: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  };

  const taskStatusIcons = {
    0: <Clock size={16} className="text-gray-600" />,
    1: <BarChart3 size={16} className="text-blue-600" />,
    2: <CheckCircle size={16} className="text-green-600" />,
  };

  const taskStatusText = {
    0: t("pending"),
    1: t("inProgress"),
    2: t("completed"),
  };

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        setLoading(true);
        const taskData = await taskService.getTaskById(taskId);
        console.log(taskData);
        setTask(taskData);
      } catch (error) {
        console.error("Error fetching task details:", error);
        setError(t("fetchError"));
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchTaskDetails();
    }
  }, [taskId, t]);

  const handleBackToTasks = () => {
    navigate(`/dashboard/projects/${projectId}/tasks`);
  };

  const handleEditTask = () => {
    navigate(`/dashboard/projects/${projectId}/tasks/${taskId}/edit`);
  };

  const handleAssignUsers = () => {
    navigate(`/dashboard/projects/${projectId}/tasks/${taskId}/assign-users`);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-background flex items-center justify-center">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
          role="status"
          aria-label="Loading">
          <span className="sr-only">{t("loading")}</span>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen p-6 bg-background">
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4" aria-hidden="true">
            ❌
          </div>
          <h2 className="text-2xl font-bold text-text mb-4">
            {error || t("taskNotFound")}
          </h2>
          <Button onClick={handleBackToTasks} className="!w-auto px-6 py-3">
            {t("backToTasks")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-background text-text">
      {/* Header */}
      <header
        className={`flex items-center justify-between mb-8 ${
          isRTL ? "flex-row-reverse" : ""
        }`}>
        <div
          className={`flex items-center gap-4 ${
            isRTL ? "flex-row-reverse" : ""
          }`}>
          <Button
            onClick={handleBackToTasks}
            variant="secondary"
            className={`flex items-center gap-2 !w-auto px-4 py-2 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
            aria-label={t("backToTasks")}>
            <ArrowLeft size={20} />
            <span>{t("backToTasks")}</span>
          </Button>

          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {task.name}
            </h1>
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-medium mt-2 inline-flex items-center gap-1.5 ${
                taskStatusColors[task.status] || taskStatusColors[0]
              }`}>
              {taskStatusIcons[task.status]}
              {taskStatusText[task.status]}
            </span>
          </div>
        </div>

        <div
          className={`flex items-center gap-3 ${
            isRTL ? "flex-row-reverse" : ""
          }`}>
          <Button
            onClick={handleAssignUsers}
            variant="secondary"
            className={`flex items-center gap-2 !w-auto px-4 py-2 ${
              isRTL ? "flex-row-reverse" : ""
            }`}>
            <Users size={20} />
            <span>{t("assignUsers")}</span>
          </Button>

          <Button
            onClick={handleEditTask}
            className={`flex items-center gap-2 !w-auto px-4 py-2 ${
              isRTL ? "flex-row-reverse" : ""
            }`}>
            <Edit size={20} />
            <span>{t("editTask")}</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-600/50 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* المعلومات الرئيسية */}
            <div className="lg:col-span-2 space-y-6">
              {/* الوصف */}
              <section>
                <div
                  className={`flex items-center gap-3 mb-4 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}>
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <FileText size={20} className="text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {t("taskDescription")}
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {task.description || t("noDescription")}
                </p>
              </section>

              {/* التقدم */}
              <section>
                <div
                  className={`flex items-center gap-3 mb-4 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}>
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                    <BarChart3 size={20} className="text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {t("taskProgress")}
                  </h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t("completionRate")}
                    </span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {task.success_rate || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${task.success_rate || 0}%` }}
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* المعلومات الجانبية */}
            <aside className="space-y-6">
              {/* معلومات المهمة */}
              <section className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  {t("taskDetails")}
                </h3>
                <div className="space-y-4">
                  <div
                    className={`flex items-center gap-3 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}>
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Calendar size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t("startDate")}
                      </p>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">
                        {task.start_date
                          ? new Date(task.start_date).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-3 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}>
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                      <Calendar size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t("endDate")}
                      </p>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">
                        {task.end_date
                          ? new Date(task.end_date).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-3 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}>
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t("assignedTo")}
                      </p>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">
                        {task.username || t("unassigned")}
                      </p>
                    </div>
                  </div>

                  {task.evaluationAdmin > 0 && (
                    <div
                      className={`flex items-center gap-3 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}>
                      <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                        <Target size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t("evaluation")}
                        </p>
                        <p className="font-medium text-gray-800 dark:text-white text-sm">
                          {task.evaluationAdmin}/10
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* ملاحظات المشرف */}
              {task.notesadmin && (
                <section className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    {t("adminNotes")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {task.notesadmin}
                  </p>
                </section>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
