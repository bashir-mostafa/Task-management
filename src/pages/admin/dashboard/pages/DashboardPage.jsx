// src/pages/admin/dashboard/DashboardPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Briefcase,
  ListTodo,
  Layers,
  CheckCircle,
  Clock,
  AlertCircle,
  PauseCircle,
  Calendar,
  Target,
  Activity,
} from "lucide-react";

import { StatisticsServices } from "../services/StatisticsServices";

import Card from "../../../../components/UI/Card";
import ProgressBar from "../../../../components/UI/ProgressBar";
import ButtonHero from "../../../../components/UI/ButtonHero";
import Toast from "../../../../components/Toast";

export default function DashboardPage() {
  const { t } = useTranslation();

  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // ألوان الحالات
  const statusColors = {
    planning: "bg-blue-500",
    Underimplementation: "bg-yellow-500",
    Complete: "bg-green-500",
    Notimplemented: "bg-red-500",
    Pause: "bg-orange-500",
  };

  const statusIcons = {
    planning: <Calendar size={16} />,
    Underimplementation: <Activity size={16} />,
    Complete: <CheckCircle size={16} />,
    Notimplemented: <AlertCircle size={16} />,
    Pause: <PauseCircle size={16} />,
  };

  // خريطة لتحويل مفاتيح API إلى مفاتيح الترجمة
  const statusMap = {
    // المفاتيح من API => المفاتيح في ملف الترجمة
    "planning": "planning",
    "Underimplementation": "underImplementation",
    "Complete": "complete",
    "Notimplemented": "notImplemented",
    "Pause": "paused"
  };

  const getStatusText = (status) => {
    const translationKey = statusMap[status] || status;
    return t(translationKey);
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError("");

      const stats = await StatisticsServices.getSummaryStatistics();
      setStatistics(stats);
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("fetchError");
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  // حساب النسب المئوية
  const calculatedStats = useMemo(() => {
    if (!statistics) return null;

    const totalProjects = statistics.totalProjects;
    const totalTasks = statistics.totalTasks;
    const totalSupTasks = statistics.totalSupTasks;

    // نسب إنجاز المشاريع
    const projectCompletionRate = totalProjects > 0
      ? Math.round((statistics.projects.complete / totalProjects) * 100)
      : 0;

    // نسب إنجاز المهام
    const taskCompletionRate = totalTasks > 0
      ? Math.round((statistics.tasks.complete / totalTasks) * 100)
      : 0;

    // نسب إنجاز المهام الفرعية
    const supTaskCompletionRate = totalSupTasks > 0
      ? Math.round((statistics.supTasks.complete / totalSupTasks) * 100)
      : 0;

    // متوسط الإنجاز العام
    const overallCompletionRate = Math.round(
      (projectCompletionRate + taskCompletionRate + supTaskCompletionRate) / 3
    );

    return {
      projectCompletionRate,
      taskCompletionRate,
      supTaskCompletionRate,
      overallCompletionRate,
    };
  }, [statistics]);

  // عرض حالة التحميل
  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-background text-text transition-colors duration-300">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {t("loadingStatistics")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // عرض حالة الخطأ
  if (error) {
    return (
      <div className="min-h-screen p-6 bg-background text-text transition-colors duration-300">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              {t("errorLoading")}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {error}
            </p>
            <ButtonHero
              onClick={fetchStatistics}
              variant="primary"
              className="mt-4">
              {t("retry")}
            </ButtonHero>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 bg-background text-text transition-colors duration-300">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-text">
          {t("dashboard")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("dashboardDescription")}
        </p>
      </div>

      {/* Overall Statistics Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Overall Completion Card */}
        <Card className="p-4 md:p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">{t("overallCompletion")}</h3>
              <p className="text-sm opacity-90">{t("allProjectsTasks")}</p>
            </div>
            <TrendingUp size={24} className="opacity-80" />
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold mb-2">
              {calculatedStats?.overallCompletionRate || 0}%
            </div>
            <ProgressBar
              value={calculatedStats?.overallCompletionRate || 0}
              height="h-2"
              color="white"
              className="bg-white/30"
            />
          </div>
        </Card>

        {/* Projects Card */}
        <Card className="p-4 md:p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">{t("projects")}</h3>
              <p className="text-sm opacity-90">{t("totalProjects")}</p>
            </div>
            <Briefcase size={24} className="opacity-80" />
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold mb-2">
              {statistics?.totalProjects || 0}
            </div>
            <div className="text-sm opacity-90">
              {t("completionRate")}: {calculatedStats?.projectCompletionRate || 0}%
            </div>
          </div>
        </Card>

        {/* Tasks Card */}
        <Card className="p-4 md:p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">{t("tasks")}</h3>
              <p className="text-sm opacity-90">{t("totalTasks")}</p>
            </div>
            <ListTodo size={24} className="opacity-80" />
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold mb-2">
              {statistics?.totalTasks || 0}
            </div>
            <div className="text-sm opacity-90">
              {t("completionRate")}: {calculatedStats?.taskCompletionRate || 0}%
            </div>
          </div>
        </Card>

        {/* Sub-Tasks Card */}
        <Card className="p-4 md:p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">{t("subTasks")}</h3>
              <p className="text-sm opacity-90">{t("totalSubTasks")}</p>
            </div>
            <Layers size={24} className="opacity-80" />
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold mb-2">
              {statistics?.totalSupTasks || 0}
            </div>
            <div className="text-sm opacity-90">
              {t("completionRate")}: {calculatedStats?.supTaskCompletionRate || 0}%
            </div>
          </div>
        </Card>
      </section>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects Status */}
        <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("projectsStatus")}
            </h3>
            <Briefcase size={20} className="text-gray-500 dark:text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {Object.entries(statistics?.projects || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${statusColors[status]}`}></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {getStatusText(status)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {count}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({statistics.totalProjects > 0 ? Math.round((count / statistics.totalProjects) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {t("total")}
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {statistics?.totalProjects || 0}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Tasks Status */}
        <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("tasksStatus")}
            </h3>
            <ListTodo size={20} className="text-gray-500 dark:text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {Object.entries(statistics?.tasks || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${statusColors[status]}`}></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {getStatusText(status)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {count}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({statistics.totalTasks > 0 ? Math.round((count / statistics.totalTasks) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {t("total")}
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {statistics?.totalTasks || 0}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Sub-Tasks Status */}
        <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("subTasksStatus")}
            </h3>
            <Layers size={20} className="text-gray-500 dark:text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {Object.entries(statistics?.supTasks || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${statusColors[status]}`}></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {getStatusText(status)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {count}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({statistics.totalSupTasks > 0 ? Math.round((count / statistics.totalSupTasks) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {t("total")}
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {statistics?.totalSupTasks || 0}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Completion Rates Chart */}
        <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("completionRates")}
            </h3>
            <BarChart3 size={20} className="text-gray-500 dark:text-gray-400" />
          </div>
          
          <div className="space-y-6">
            {/* Projects Completion */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("projects")}
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {calculatedStats?.projectCompletionRate || 0}%
                </span>
              </div>
              <ProgressBar
                value={calculatedStats?.projectCompletionRate || 0}
                height="h-4"
                color="purple"
              />
            </div>
            
            {/* Tasks Completion */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("tasks")}
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {calculatedStats?.taskCompletionRate || 0}%
                </span>
              </div>
              <ProgressBar
                value={calculatedStats?.taskCompletionRate || 0}
                height="h-4"
                color="green"
              />
            </div>
            
            {/* Sub-Tasks Completion */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("subTasks")}
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {calculatedStats?.supTaskCompletionRate || 0}%
                </span>
              </div>
              <ProgressBar
                value={calculatedStats?.supTaskCompletionRate || 0}
                height="h-4"
                color="orange"
              />
            </div>
          </div>
        </Card>

        {/* Status Distribution */}
        <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("statusDistribution")}
            </h3>
            <PieChart size={20} className="text-gray-500 dark:text-gray-400" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Status Legend */}
            <div className="space-y-3">
              {Object.entries(statusColors).map(([status, color]) => (
                <div key={status} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${color}`}></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {getStatusText(status)}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Status Counts */}
            <div className="space-y-3">
              {Object.entries(statusColors).map(([status]) => {
                const totalCount = 
                  (statistics?.projects[status] || 0) +
                  (statistics?.tasks[status] || 0) +
                  (statistics?.supTasks[status] || 0);
                
                return (
                  <div key={status} className="text-right">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {totalCount}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      {t("items")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("totalItems")}
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {((statistics?.totalProjects || 0) + (statistics?.totalTasks || 0) + (statistics?.totalSupTasks || 0))}
              </span>
            </div>
          </div>
        </Card>
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
    </div>
  );
}