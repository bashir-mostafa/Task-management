import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  User,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  UserPlus,
  Pause,
  Play,
  Eye,
  ChevronRight,
  FileText,
  Loader,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { taskService } from "../../services/taskService";
import { projectService } from "../../services/projectService";
import DataTableLayout from "../../../../../components/Layout/DataTableLayout";
import ProgressBar from "../../../../../components/UI/ProgressBar";
import Button from "../../../../../components/UI/Button";
import Modal from "../../../../../components/UI/Modal";
import DeleteConfirmationModal from "../../../../../components/UI/DeleteConfirmationModal";
import Toast from "../../../../../components/Toast";
import Pagination from "../../../../../components/UI/Pagination";

export default function ProjectTasksPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(10);
  const [selectedTasks, setSelectedTasks] = useState([]);

  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [bulkPauseModalOpen, setBulkPauseModalOpen] = useState(false);
  const [bulkResumeModalOpen, setBulkResumeModalOpen] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const isRTL = i18n.language === "ar";

  // Status configuration
  const statusMap = useMemo(
    () => ({
      "Notimplemented": "notImplemented",
      "Underimplementation": "underImplementation",
      "Complete": "completed",
      "Pause": "paused",
    }),
    []
  );

  const statusColors = useMemo(
    () => ({
      "Notimplemented":
        "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border border-gray-200 dark:border-gray-800",
      "Underimplementation":
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
      "Complete":
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800",
      "Pause":
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800",
    }),
    []
  );

  const statusIcons = useMemo(
    () => ({
      "Notimplemented": <Clock size={16} className="text-gray-600 dark:text-gray-400" />,
      "Underimplementation": <AlertCircle size={16} className="text-blue-600 dark:text-blue-400" />,
      "Complete": <CheckCircle size={16} className="text-green-600 dark:text-green-400" />,
      "Pause": <Pause size={16} className="text-orange-600 dark:text-orange-400" />,
    }),
    []
  );

  // Toast handlers
  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  // Status text mapper
  const getStatusText = useCallback(
    (statusString) => {
      return statusMap[statusString] || "notImplemented";
    },
    [statusMap]
  );

  // Fetch project and tasks data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch project details
      const projectResult = await projectService.getProjectById(projectId);
      if (!projectResult.project) {
        throw new Error("Project not found");
      }
      setProject(projectResult.project);

      // Fetch tasks
      const tasksResult = await taskService.getTasksByProject(projectId);
      setTasks(tasksResult.data || []);
      setSelectedTasks([]); // Reset selected tasks
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("fetchError");
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [projectId, t, showToast]);

  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId, fetchData]);

  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchTerm, statusFilter]);

  // Pagination
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  // Selection handlers
  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedTasks(currentTasks.map(task => task.id));
    } else {
      setSelectedTasks([]);
    }
  };

  const toggleSelectTask = (id, checked) => {
    if (checked) {
      setSelectedTasks([...selectedTasks, id]);
    } else {
      setSelectedTasks(selectedTasks.filter(taskId => taskId !== id));
    }
  };

  // Bulk operations
  const handleBulkDeleteClick = () => {
    if (selectedTasks.length > 0) {
      setBulkDeleteModalOpen(true);
    }
  };

  const handleBulkPauseClick = () => {
    if (selectedTasks.length > 0) {
      setBulkPauseModalOpen(true);
    }
  };

  const handleBulkResumeClick = () => {
    if (selectedTasks.length > 0) {
      setBulkResumeModalOpen(true);
    }
  };

  const handleConfirmBulkDelete = async () => {
    try {
      // حذف جميع المهام المحددة
      for (const taskId of selectedTasks) {
        await taskService.deleteTask(taskId);
      }
      
      showToast(
        t("tasksDeletedSuccessfully", { count: selectedTasks.length }), 
        "success"
      );
      setBulkDeleteModalOpen(false);
      setSelectedTasks([]);
      fetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("deleteError");
      showToast(errorMessage, "error");
    }
  };

  const handleConfirmBulkPause = async () => {
    try {
      let pausedCount = 0;
      let failedCount = 0;
      
      // إيقاف المهام المحددة
      for (const taskId of selectedTasks) {
        try {
          const task = tasks.find(t => t.id === taskId);
          if (task && task.status === "Underimplementation") {
            await taskService.pauseTask(taskId);
            pausedCount++;
          } else {
            failedCount++;
          }
        } catch (error) {
          failedCount++;
        }
      }
      
      if (pausedCount > 0) {
        showToast(
          t("tasksPausedSuccessfully", { count: pausedCount }), 
          "success"
        );
      }
      
      if (failedCount > 0) {
        showToast(
          t("someTasksNotPaused", { count: failedCount }), 
          "warning"
        );
      }
      
      setBulkPauseModalOpen(false);
      setSelectedTasks([]);
      fetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("actionError");
      showToast(errorMessage, "error");
    }
  };

  const handleConfirmBulkResume = async () => {
    try {
      let resumedCount = 0;
      let failedCount = 0;
      
      // استئناف المهام المحددة
      for (const taskId of selectedTasks) {
        try {
          const task = tasks.find(t => t.id === taskId);
          if (task && task.status === "Pause") {
            await taskService.resumeTask(taskId);
            resumedCount++;
          } else {
            failedCount++;
          }
        } catch (error) {
          failedCount++;
        }
      }
      
      if (resumedCount > 0) {
        showToast(
          t("tasksResumedSuccessfully", { count: resumedCount }), 
          "success"
        );
      }
      
      if (failedCount > 0) {
        showToast(
          t("someTasksNotResumed", { count: failedCount }), 
          "warning"
        );
      }
      
      setBulkResumeModalOpen(false);
      setSelectedTasks([]);
      fetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("actionError");
      showToast(errorMessage, "error");
    }
  };

  // Task operations
  const handleEditTask = useCallback((task) => {
    navigate(`/projects/${projectId}/tasks/${task.id}/edit`);
  }, [navigate, projectId]);

  const handleDeleteClick = useCallback((task) => {
    setTaskToDelete(task);
    setDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    try {
      await taskService.deleteTask(taskToDelete.id);
      showToast(t("taskDeletedSuccessfully"), "success");
      setDeleteModalOpen(false);
      setTaskToDelete(null);
      fetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("deleteError");
      showToast(errorMessage, "error");
    }
  }, [taskToDelete, t, showToast, fetchData]);

  const handlePauseTask = useCallback(async (task) => {
    try {
      await taskService.pauseTask(task.id);
      showToast(t("taskPausedSuccessfully"), "success");
      fetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("actionError");
      showToast(errorMessage, "error");
    }
  }, [t, showToast, fetchData]);

  const handleResumeTask = useCallback(async (task) => {
    try {
      await taskService.resumeTask(task.id);
      showToast(t("taskResumedSuccessfully"), "success");
      fetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("actionError");
      showToast(errorMessage, "error");
    }
  }, [t, showToast, fetchData]);

  const handleAssignUsers = useCallback(
    (task) => {
      navigate(`/projects/${projectId}/tasks/${task.id}/assign-users`);
    },
    [navigate, projectId]
  );

  const handleViewTask = useCallback(
    (taskId) => {
      navigate(`/projects/${projectId}/tasks/${taskId}`);
    },
    [navigate, projectId]
  );

  const handleAddTask = useCallback(() => {
    navigate(`/projects/${projectId}/tasks/create`);
  }, [navigate, projectId]);

  // Statistics
  const statistics = useMemo(() => {
    const completedTasks = tasks.filter((task) => task.status === "Complete").length;
    const inProgressTasks = tasks.filter((task) => task.status === "Underimplementation").length;
    const pendingTasks = tasks.filter((task) => task.status === "Notimplemented").length;
    const pausedTasks = tasks.filter((task) => task.status === "Pause").length;

    return {
      completedTasks,
      inProgressTasks,
      pendingTasks,
      pausedTasks,
      totalTasks: tasks.length,
      completionRate:
        tasks.length > 0
          ? Math.round((completedTasks / tasks.length) * 100)
          : 0,
    };
  }, [tasks]);

  // Table rendering
  const renderTasksTable = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader size={32} className="animate-spin text-primary" />
        </div>
      );
    }

    return (
      <div 
        className="bg-navbar-light dark:bg-navbar-dark rounded-xl shadow-lg border border-border overflow-hidden"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {selectedTasks.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-blue-100 dark:border-blue-800/30 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-lg">
                  <FileText size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                    {t("selectedTasks", { count: selectedTasks.length })}
                  </h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {t("selectAll")} • {t("clearSelection")}
                  </p>
                </div>
              </div>
              <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {/* زر الإيقاف - تصميم متميز */}
                <button
                  onClick={handleBulkPauseClick}
                  className="group relative overflow-hidden px-4 py-2.5 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-700/40 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2.5"
                  title={t("pauseSelected")}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center w-8 h-8 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-800 dark:to-amber-800 rounded-lg">
                    <Pause size={16} className="text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="relative text-left">
                    <div className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                      {t("pause")}
                    </div>
                    <div className="text-xs text-orange-600/70 dark:text-orange-400/70">
                      {t("pauseSelected")}
                    </div>
                  </div>
                </button>

                {/* زر الاستئناف - تصميم متميز */}
                <button
                  onClick={handleBulkResumeClick}
                  className="group relative overflow-hidden px-4 py-2.5 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-700/40 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2.5"
                  title={t("resumeSelected")}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center w-8 h-8 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-800 dark:to-green-800 rounded-lg">
                    <Play size={16} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="relative text-left">
                    <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                      {t("resume")}
                    </div>
                    <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                      {t("resumeSelected")}
                    </div>
                  </div>
                </button>

                {/* زر الحذف - تصميم متميز */}
                <button
                  onClick={handleBulkDeleteClick}
                  className="group relative overflow-hidden px-4 py-2.5 bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 border border-rose-200 dark:border-rose-700/40 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2.5"
                  title={t("deleteSelected")}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center w-8 h-8 bg-gradient-to-br from-rose-100 to-red-100 dark:from-rose-800 dark:to-red-800 rounded-lg">
                    <Trash2 size={16} className="text-rose-600 dark:text-rose-400" />
                  </div>
                  <div className="relative text-left">
                    <div className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                      {t("delete")}
                    </div>
                    <div className="text-xs text-rose-600/70 dark:text-rose-400/70">
                      {t("deleteSelected")}
                    </div>
                  </div>
                </button>

                {/* زر مسح التحديد - تصميم متميز */}
                <button
                  onClick={() => setSelectedTasks([])}
                  className="group relative overflow-hidden px-4 py-2.5 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 border border-slate-200 dark:border-slate-700/40 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2.5"
                  title={t("clearSelection")}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-gray-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center w-8 h-8 bg-gradient-to-br from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 rounded-lg">
                    <RefreshCw size={16} className="text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="relative text-left">
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t("clear")}
                    </div>
                    <div className="text-xs text-slate-600/70 dark:text-slate-400/70">
                      {t("clearSelection")}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-gray-50 dark:bg-gray-800">
                <th className="px-4 py-4 w-12">
                  {/* <input
                    type="checkbox"
                    checked={currentTasks.length > 0 && selectedTasks.length === currentTasks.length}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                  /> */}
                </th>
                <th className={`px-4 py-4 text-sm font-medium text-navbar-text-light dark:text-navbar-text-dark ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('taskName')}
                </th>
                <th className={`px-4 py-4 text-sm font-medium text-navbar-text-light dark:text-navbar-text-dark ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('status')}
                </th>
                <th className={`px-4 py-4 text-sm font-medium text-navbar-text-light dark:text-navbar-text-dark ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('dates')}
                </th>
                <th className={`px-4 py-4 text-sm font-medium text-navbar-text-light dark:text-navbar-text-dark ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('evaluation')}
                </th>
                <th className={`px-4 py-4 text-sm font-medium text-navbar-text-light dark:text-navbar-text-dark ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900">
              {currentTasks.length === 0 ? (
                <tr>
                  <td 
                    colSpan="6" 
                    className={`px-4 py-8 text-center text-gray-500 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    {searchTerm || statusFilter !== "all" ? t('noTasksMatchFilters') : t('noTasksInProject')}
                  </td>
                </tr>
              ) : (
                currentTasks.map((task) => (
                  <tr 
                    key={task.id} 
                    className={`border-b border-border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      selectedTasks.includes(task.id) 
                        ? 'bg-blue-50 dark:bg-blue-900/10' 
                        : ''
                    }`}
                  >
                    <td className="px-4 py-4">
                      {/* <input
                        type="checkbox"
                        checked={selectedTasks.includes(task.id)}
                        onChange={(e) => toggleSelectTask(task.id, e.target.checked)}
                        className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                      /> */}
                    </td>
                    <td className={`px-4 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <button
                        onClick={() => handleViewTask(task.id)}
                        className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 text-left flex items-center gap-2"
                      >
                        <FileText size={16} className="text-gray-400" />
                        {task.name}
                        <ChevronRight size={14} className="text-gray-400" />
                      </button>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {task.description || t('noDescription')}
                      </div>
                      {task.create_by && (
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                          <User size={12} />
                          {t("createdBy")}: {task.create_by}
                        </div>
                      )}
                    </td>
                    <td className={`px-4 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${
                          statusColors[task.status] || statusColors.Notimplemented
                        }`}
                      >
                        {statusIcons[task.status]}
                        {t(getStatusText(task.status))}
                      </span>
                    </td>
                    <td className={`px-4 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {task.start_date ? new Date(task.start_date).toLocaleDateString() : t('notSet')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {task.end_date ? new Date(task.end_date).toLocaleDateString() : t('notSet')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-24">
                            <ProgressBar
                              value={(parseInt(task.evaluation_admin) || 0) * 20}
                              height="h-2"
                              color="blue"
                              showPercentage={false}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {task.evaluation_admin || 0}/5
                          </span>
                        </div>
                        {task.success_rate > 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {t("progress")}: {task.success_rate}%
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={`px-4 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <button
                          onClick={() => handleViewTask(task.id)}
                          className="p-2 rounded-lg transition-colors text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                          title={t("view")}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleAssignUsers(task)}
                          className="p-2 rounded-lg transition-colors text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                          title={t("assignUsers")}
                        >
                          <UserPlus size={16} />
                        </button>
                        {task.status === "Underimplementation" && (
                          <button
                            onClick={() => handlePauseTask(task)}
                            className="p-2 rounded-lg transition-colors text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30"
                            title={t("pauseTask")}
                          >
                            <Pause size={16} />
                          </button>
                        )}
                        {task.status === "Pause" && (
                          <button
                            onClick={() => handleResumeTask(task)}
                            className="p-2 rounded-lg transition-colors text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30"
                            title={t("resumeTask")}
                          >
                            <Play size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleEditTask(task)}
                          className="p-2 rounded-lg transition-colors text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                          title={t("edit")}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(task)}
                          className="p-2 rounded-lg transition-colors text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                          title={t("delete")}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredTasks.length > 0 && (
          <div className="px-4 py-4 border-t border-border bg-white dark:bg-gray-900">
            <Pagination
              pagination={{
                currentPage,
                totalPages,
                totalCount: filteredTasks.length,
                perPage: tasksPerPage
              }}
              onPageChange={setCurrentPage}
              itemsName="tasks"
              showProgress={true}
            />
          </div>
        )}
      </div>
    );
  };

  // Stats for DataTableLayout
  const stats = useMemo(
    () => [
      {
        title: "totalTasks",
        value: statistics.totalTasks,
        subValue: `${statistics.completionRate}% ${t("completionRate")}`,
        color: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200/50 dark:border-blue-700/30",
        valueColor: "text-blue-600 dark:text-blue-400",
      },
      {
        title: "completed",
        value: statistics.completedTasks,
        subValue: `${statistics.totalTasks > 0 ? Math.round((statistics.completedTasks / statistics.totalTasks) * 100) : 0}%`,
        color: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200/50 dark:border-green-700/30",
        valueColor: "text-green-600 dark:text-green-400",
      },
      {
        title: "inProgress",
        value: statistics.inProgressTasks,
        subValue: `${statistics.totalTasks > 0 ? Math.round((statistics.inProgressTasks / statistics.totalTasks) * 100) : 0}%`,
        color: "from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200/50 dark:border-yellow-700/30",
        valueColor: "text-yellow-600 dark:text-yellow-400",
      },
      {
        title: "paused",
        value: statistics.pausedTasks,
        subValue: `${statistics.totalTasks > 0 ? Math.round((statistics.pausedTasks / statistics.totalTasks) * 100) : 0}%`,
        color: "from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200/50 dark:border-orange-700/30",
        valueColor: "text-orange-600 dark:text-orange-400",
      },
    ],
    [statistics, t]
  );

  // Filters for DataTableLayout
  const filters = [
    {
      value: statusFilter,
      onChange: setStatusFilter,
      icon: <Filter size={16} />,
      options: [
        { value: "all", label: t("allStatuses") },
        { value: "Notimplemented", label: t("notImplemented") },
        { value: "Underimplementation", label: t("underImplementation") },
        { value: "Complete", label: t("completed") },
        { value: "Pause", label: t("paused") },
      ],
    },
  ];

  // Bulk actions for DataTableLayout
  const bulkActions = [
    {
      label: t("pause"),
      onClick: handleBulkPauseClick,
      icon: <Pause size={16} />,
      variant: "warning",
      disabled: selectedTasks.length === 0,
    },
    {
      label: t("resume"),
      onClick: handleBulkResumeClick,
      icon: <Play size={16} />,
      variant: "success",
      disabled: selectedTasks.length === 0,
    },
    {
      label: `${t("delete")} (${selectedTasks.length})`,
      onClick: handleBulkDeleteClick,
      icon: <Trash2 size={16} />,
      variant: "danger",
      disabled: selectedTasks.length === 0,
    },
  ];

  return (
    <DataTableLayout
      title={t("taskManagement")}
      subtitle={project ? `${project.name} - ${project.description}` : ""}
      backUrl={`/projects/${projectId}`}
      backLabel={t("backToProject")}
      showAddButton={true}
      addButtonLabel={t("addTask")}
      onAddClick={handleAddTask}
      showBulkDelete={selectedTasks.length > 0}
      onBulkDelete={handleBulkDeleteClick}
      bulkDeleteLabel={`${t("delete")} (${selectedTasks.length})`}
      bulkActions={bulkActions}
      selectedCount={selectedTasks.length}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder={t("searchTasks")}
      filters={filters}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      stats={stats}
      loading={loading}
      error={error || (!project && !loading ? t("projectNotFound") : null)}
      isEmpty={filteredTasks.length === 0}
      emptyMessage={
        searchTerm || statusFilter !== "all"
          ? t("noTasksMatchFilters")
          : t("noTasksInProject")
      }
      emptyAction={{
        label: t("createTask"),
        onClick: handleAddTask,
      }}
      isRTL={isRTL}
      hiddenStats={true}
      projectId={projectId}
    >
      {renderTasksTable()}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={taskToDelete?.name}
        type="task"
        count={1}
      />

      {/* Bulk Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        onConfirm={handleConfirmBulkDelete}
        itemName=""
        type="task"
        count={selectedTasks.length}
      />

      {/* Bulk Pause Confirmation Modal */}
      <Modal
        isOpen={bulkPauseModalOpen}
        onClose={() => setBulkPauseModalOpen(false)}
        title={t("pauseSelectedTasks")}
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <AlertTriangle size={20} className="text-orange-600 dark:text-orange-400" />
            <p className="text-sm text-orange-700 dark:text-orange-300">
              {t("confirmBulkPause", { count: selectedTasks.length })}
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setBulkPauseModalOpen(false)}
              className="px-4 py-2"
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleConfirmBulkPause}
              variant="warning"
              className="px-4 py-2 flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            >
              <Pause size={16} />
              {t("pauseSelectedTasks")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Resume Confirmation Modal */}
      <Modal
        isOpen={bulkResumeModalOpen}
        onClose={() => setBulkResumeModalOpen(false)}
        title={t("resumeSelectedTasks")}
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <RefreshCw size={20} className="text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              {t("confirmBulkResume", { count: selectedTasks.length })}
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setBulkResumeModalOpen(false)}
              className="px-4 py-2"
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleConfirmBulkResume}
              variant="success"
              className="px-4 py-2 flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
            >
              <Play size={16} />
              {t("resumeSelectedTasks")}
            </Button>
          </div>
        </div>
      </Modal>

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
    </DataTableLayout>
  );
}

export { ProjectTasksPage };