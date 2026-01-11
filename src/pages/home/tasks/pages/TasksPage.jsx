// src/pages/admin/projects/pages/UserTasksPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Search,
  Filter,
  Calendar,
  User,
  BarChart3,
  ListTodo,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
} from "lucide-react";

import { taskUserService } from "../services/taskUserService";
import CustomDropdown from "../../../../components/UI/Dropdown"; // استيراد المكون

import DetailsLayout from "../../../../components/Layout/DetailsLayout";
import DetailsCard from "../../../../components/UI/DetailsCard";
import ProgressBar from "../../../../components/UI/ProgressBar";
import DetailItem from "../../../../components/UI/DetailItem";
import ButtonHero from "../../../../components/UI/ButtonHero";
import Toast from "../../../../components/Toast";
import InputField from "../../../../components/UI/InputField";

export default function UserTasksPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [isRTL] = useState(i18n.language === "ar");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states
  const [filters, setFilters] = useState({
    name: "",
    status: "",
    sortDirection: "desc"
  });

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Task status colors
  const statusColors = {
    1: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", // Planning
    2: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", // Completed
    3: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", // Not Implemented
    4: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300", // Paused
  };

  const statusIcons = {
    1: <Clock size={16} className="text-blue-600 dark:text-blue-400" />, 
    2: <CheckCircle size={16} className="text-green-600 dark:text-green-400" />,
    3: <AlertCircle size={16} className="text-red-600 dark:text-red-400" />,
    4: <Clock size={16} className="text-orange-600 dark:text-orange-400" />,
  };

  const getStatusText = useCallback((status) => {
    switch (status) {
      case 1:
        return t("inProgress");
      case 2:
        return t("completed");
      case 3:
        return t("notImplemented");
      case 4:
        return t("paused"); 
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

  const fetchUserTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        pageNumber: currentPage,
        pageSize: pageSize,
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === "" || params[key] === undefined) {
          delete params[key];
        }
      });

      const result = await taskUserService.getAllTasks(params);
      
      setTasks(result.data || []);
      setTotalCount(result.totalCount || 0);
      setTotalPages(Math.ceil((result.totalCount || 0) / pageSize));
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("fetchError");
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters, t, showToast]);

  useEffect(() => {
    fetchUserTasks();
  }, [fetchUserTasks]);

  const handleViewTask = useCallback(
    (taskId) => navigate(`/home/tasks/${taskId}`),
    [navigate]
  );

  const toggleTaskExpand = useCallback(
    (taskId) => setExpandedTaskId(expandedTaskId === taskId ? null : taskId),
    [expandedTaskId]
  );

  // Pagination handlers
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of tasks section
    const tasksSection = document.getElementById('tasks-section');
    if (tasksSection) {
      tasksSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleSearch = () => {
    fetchUserTasks();
  };

  const handleResetFilters = () => {
    setFilters({
      name: "",
      status: "",
      sortDirection: "desc"
    });
    setCurrentPage(1);
  };

  // Statistics calculation
  const statistics = useMemo(() => {
    const completedTasks = tasks.filter(task => task.status === 3).length;
    const inProgressTasks = tasks.filter(task => task.status === 2).length;
    const planningTasks = tasks.filter(task => task.status === 1).length;
    const pausedTasks = tasks.filter(task => task.status === 4).length;
    const notImplementedTasks = tasks.filter(task => task.status === 5).length;

    const totalTasks = tasks.length;
    const completionPercentage = totalTasks > 0 ? 
      Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      completedTasks,
      inProgressTasks,
      planningTasks,
      pausedTasks,
      notImplementedTasks,
      totalTasks,
      completionPercentage
    };
  }, [tasks]);

  // Calculate start and end indexes for display
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);

  // خيارات الحالة للـ Dropdown
  const statusOptions = useMemo(() => [
    { value: "", label: t("allStatuses") },
    { value: "1", label: t("inProgress") },
    { value: "2", label: t("completed") },
    { value: "3", label: t("notImplemented") },
    { value: "4", label: t("paused") },  
  ], [t]);

  // خيارات الترتيب للـ Dropdown
  const sortOptions = useMemo(() => [
    { value: "desc", label: t("newestFirst") },
    { value: "asc", label: t("oldestFirst") }
  ], [t]);

  // خيارات حجم الصفحة للـ Dropdown
  const pageSizeOptions = useMemo(() => [
    { value: "10", label: "10 " + t("tasks") },
    { value: "20", label: "20 " + t("tasks") },
    { value: "50", label: "50 " + t("tasks") },
    { value: "100", label: "100 " + t("tasks") }
  ], [t]);

  return (
    <DetailsLayout
      title={t("myTasks")}
      subtitle={t("userTasksDescription")}
      loading={loading}
      error={error}
      onBack={() => navigate("/home")}
      backLabel={t("backToDashboard")}
      isRTL={isRTL}>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t("totalTasks")}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {statistics.totalTasks}
              </p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ListTodo className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t("inProgress")}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {statistics.inProgressTasks}
              </p>
            </div>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <BarChart3 className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t("completed")}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {statistics.completedTasks}
              </p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t("completionRate")}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {statistics.completionPercentage}%
              </p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <DetailsCard 
        title={t("filters")} 
        icon={Filter}
        className="mb-6"
        actions={
          <div className="flex gap-2">
            <ButtonHero
              onClick={handleResetFilters}
              variant="secondary"
              size="sm"
              isRTL={isRTL}
              className="flex items-center gap-2">
              {t("resetFilters")}
            </ButtonHero>
            <ButtonHero
              onClick={handleSearch}
              variant="primary"
              size="sm"
              isRTL={isRTL}
              icon={Search}
              iconPosition={isRTL ? "right" : "left"}
              className="flex items-center gap-2">
              {t("search")}
            </ButtonHero>
          </div>
        }>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* حقل البحث */}
          <div className="md:col-span-2">
            <InputField
              label={t("taskName")}
              value={filters.name}
              onChange={(e) => handleFilterChange("name", e.target.value)}
              placeholder={t("searchByName")}
              icon={Search}
              isRTL={isRTL}
            />
          </div>
          
          {/* Dropdown للحالة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("status")}
            </label>
            <CustomDropdown
              options={statusOptions}
              value={filters.status}
              onChange={(value) => handleFilterChange("status", value)}
              placeholder={t("allStatuses")}
              isRTL={isRTL}
              size="small"
              className="w-full"
            />
          </div>
          
          {/* Dropdown للترتيب */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("sortBy")}
            </label>
            <CustomDropdown
              options={sortOptions}
              value={filters.sortDirection}
              onChange={(value) => handleFilterChange("sortDirection", value)}
              placeholder={t("newestFirst")}
              isRTL={isRTL}
              size="small"
              className="w-full"
            />
          </div>
        </div>

        {/* Dropdown لحجم الصفحة */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t("itemsPerPage")}
            </div>
            <div className="w-32">
              <CustomDropdown
                options={pageSizeOptions}
                value={pageSize.toString()}
                onChange={(value) => {
                  setPageSize(parseInt(value));
                  setCurrentPage(1);
                }}
                placeholder={`${pageSize} ${t("tasks")}`}
                isRTL={isRTL}
                size="small"
              />
            </div>
          </div>
        </div>
      </DetailsCard>

      {/* Tasks List */}
      <DetailsCard
        id="tasks-section"
        title={t("myTasks")}
        icon={ListTodo}
        actions={
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t("showing")} {startIndex}-{endIndex} {t("of")} {totalCount}
            </span>
            
            {/* Dropdown للصفحات السريعة */}
            {totalPages > 1 && (
              <div className="w-24">
                <CustomDropdown
                  options={Array.from({ length: totalPages }, (_, i) => ({
                    value: (i + 1).toString(),
                    label: `${t("page")} ${i + 1}`
                  }))}
                  value={currentPage.toString()}
                  onChange={(value) => handlePageChange(parseInt(value))}
                  placeholder={`${t("page")} ${currentPage}`}
                  isRTL={isRTL}
                  size="small"
                />
              </div>
            )}
          </div>
        }>
        
        {tasks.length > 0 ? (
          <>
            <div className="space-y-3">
              {tasks.map((task) => {
                const taskStatus = task.status || 1;
                const translatedTaskStatus = getStatusText(taskStatus);

                return (
                  <div
                    key={task.id}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm hover:shadow-md">
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${
                                statusColors[taskStatus] || statusColors[1]
                              }`}>
                              {statusIcons[taskStatus] || statusIcons[1]}
                              {translatedTaskStatus}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ID: {task.id}
                            </span>
                          </div>
                          
                          <h3
                            className="text-lg font-semibold text-gray-900 dark:text-white mb-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                            onClick={() => handleViewTask(task.id)}>
                            {task.name}
                          </h3>
                          
                          {task.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>{t("startDate")}:</span>
                              <span className="font-medium text-gray-700 dark:text-gray-300 ml-1">
                                {task.start_date ? new Date(task.start_date).toLocaleDateString() : t("notSet")}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>{t("endDate")}:</span>
                              <span className="font-medium text-gray-700 dark:text-gray-300 ml-1">
                                {task.end_date ? new Date(task.end_date).toLocaleDateString() : t("notSet")}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <BarChart3 size={14} />
                              <span>{t("progress")}:</span>
                              <span className="font-medium text-gray-700 dark:text-gray-300 ml-1">
                                {task.success_rate || 0}%
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleViewTask(task.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                            title={t("viewTask")}>
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => toggleTaskExpand(task.id)}
                            className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            title={t("showDetails")}>
                            {expandedTaskId === task.id ? (
                              <ChevronUp size={18} />
                            ) : (
                              <ChevronDown size={18} />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <ProgressBar
                          value={task.success_rate || 0}
                          height="h-2"
                          color={
                            taskStatus === 3 ? "green" : 
                            taskStatus === 2 ? "yellow" :
                            taskStatus === 4 ? "orange" :
                            taskStatus === 5 ? "red" : "blue"
                          }
                        />
                      </div>
                    </div>

                    {expandedTaskId === task.id && (
                      <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {t("taskDetails")}
                            </h4>
                            <div className="space-y-2">
                              <DetailItem
                                title={t("createdAt")}
                                value={task.createdAt ? new Date(task.createdAt).toLocaleString() : t("unknown")}
                                isRTL={isRTL}
                                compact
                              />
                              <DetailItem
                                title={t("taskId")}
                                value={task.id}
                                isRTL={isRTL}
                                compact
                              />
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {t("timeline")}
                            </h4>
                            <div className="space-y-2">
                              <DetailItem
                                icon={Calendar}
                                title={t("startDate")}
                                value={task.start_date ? new Date(task.start_date).toLocaleDateString() : t("notSet")}
                                isRTL={isRTL}
                                compact
                              />
                              <DetailItem
                                icon={Calendar}
                                title={t("endDate")}
                                value={task.end_date ? new Date(task.end_date).toLocaleDateString() : t("notSet")}
                                isRTL={isRTL}
                                compact
                              />
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {t("actions")}
                            </h4>
                            <div className="flex flex-col gap-2">
                              <ButtonHero
                                onClick={() => handleViewTask(task.id)}
                                variant="primary"
                                size="sm"
                                isRTL={isRTL}
                                icon={Eye}
                                iconPosition={isRTL ? "right" : "left"}
                                className="w-full">
                                {t("viewDetails")}
                              </ButtonHero>
                              <ButtonHero
                                onClick={() => navigate(`/home/tasks/${task.id}/update-progress`)}
                                variant="info"
                                size="sm"
                                isRTL={isRTL}
                                icon={Edit}
                                iconPosition={isRTL ? "right" : "left"}
                                className="w-full">
                                {t("updateProgress")}
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

            {/* Pagination Component */}
            {totalPages > 1 && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t("showing")} {startIndex}-{endIndex} {t("of")} {totalCount} {t("tasks")}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-md ${
                        currentPage === 1
                          ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                      aria-label={t("previousPage")}>
                      {isRTL ? (
                        <ChevronRight size={18} />
                      ) : (
                        <ChevronLeft size={18} />
                      )}
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {/* Always show first page */}
                      <button
                        onClick={() => handlePageChange(1)}
                        className={`px-3 py-1 text-sm rounded-md ${
                          currentPage === 1
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}>
                        1
                      </button>

                      {/* Show ellipsis if needed */}
                      {currentPage > 3 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}

                      {/* Show pages around current page */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (page) =>
                            page > 1 &&
                            page < totalPages &&
                            Math.abs(page - currentPage) <= 1
                        )
                        .map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 text-sm rounded-md ${
                              currentPage === page
                                ? "bg-blue-600 text-white"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}>
                            {page}
                          </button>
                        ))}

                      {/* Show ellipsis if needed */}
                      {currentPage < totalPages - 2 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}

                      {/* Always show last page if there is more than 1 page */}
                      {totalPages > 1 && (
                        <button
                          onClick={() => handlePageChange(totalPages)}
                          className={`px-3 py-1 text-sm rounded-md ${
                            currentPage === totalPages
                              ? "bg-blue-600 text-white"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}>
                          {totalPages}
                        </button>
                      )}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-md ${
                        currentPage === totalPages
                          ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                      aria-label={t("nextPage")}>
                      {isRTL ? (
                        <ChevronLeft size={18} />
                      ) : (
                        <ChevronRight size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <ListTodo className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              {t("noTasksFound")}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {filters.name || filters.status ? t("noTasksMatchFilters") : t("noTasksAssigned")}
            </p>
            {(filters.name || filters.status) && (
              <div className="mt-6">
                <ButtonHero
                  onClick={handleResetFilters}
                  variant="primary"
                  isRTL={isRTL}>
                  {t("clearFilters")}
                </ButtonHero>
              </div>
            )}
          </div>
        )}
      </DetailsCard>

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