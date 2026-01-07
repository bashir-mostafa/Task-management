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
  Loader
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
  const [pauseResumeModalOpen, setPauseResumeModalOpen] = useState(false);
  const [taskToPauseResume, setTaskToPauseResume] = useState(null);
  const [pauseResumeAction, setPauseResumeAction] = useState("");
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);

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

  const handleConfirmBulkDelete = async () => {
    try {
      // حذف جميع المهام المحددة
      for (const taskId of selectedTasks) {
        await taskService.deleteTask(taskId);
      }
      
      showToast(t("tasksDeletedSuccessfully", { count: selectedTasks.length }), "success");
      setBulkDeleteModalOpen(false);
      setSelectedTasks([]);
      fetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("deleteError");
      showToast(errorMessage, "error");
    }
  };

  // Task operations
  const handleEditTask = useCallback((task) => {
    // الانتقال إلى صفحة تعديل المهمة
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

  const handlePauseTask = useCallback((task) => {
    setTaskToPauseResume(task);
    setPauseResumeAction("pause");
    setPauseResumeModalOpen(true);
  }, []);

  const handleResumeTask = useCallback((task) => {
    setTaskToPauseResume(task);
    setPauseResumeAction("resume");
    setPauseResumeModalOpen(true);
  }, []);

  const handleConfirmPauseResume = useCallback(async () => {
    try {
      if (pauseResumeAction === "pause") {
        await taskService.pauseTask(taskToPauseResume.id);
        showToast(t("taskPausedSuccessfully"), "success");
      } else {
        await taskService.resumeTask(taskToPauseResume.id);
        showToast(t("taskResumedSuccessfully"), "success");
      }

      setPauseResumeModalOpen(false);
      setTaskToPauseResume(null);
      setPauseResumeAction("");
      fetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("actionError");
      showToast(errorMessage, "error");
    }
  }, [pauseResumeAction, taskToPauseResume, t, showToast, fetchData]);

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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-gray-50 dark:bg-gray-800">
                <th className="px-4 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={currentTasks.length > 0 && selectedTasks.length === currentTasks.length}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                  />
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
                    className="border-b border-border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(task.id)}
                        onChange={(e) => toggleSelectTask(task.id, e.target.checked)}
                        className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                      />
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
                              value={(parseInt(task.evaluation_admin) || 0) * 10}
                              height="h-2"
                              color="blue"
                              showPercentage={false}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {task.evaluation_admin || 0}/10
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
        label: t("createFirstTask"),
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

      {/* Pause/Resume Confirmation Modal */}
      <Modal
        isOpen={pauseResumeModalOpen}
        onClose={() => {
          setPauseResumeModalOpen(false);
          setTaskToPauseResume(null);
          setPauseResumeAction("");
        }}
        title={pauseResumeAction === "pause" ? t("pauseTask") : t("resumeTask")}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            {pauseResumeAction === "pause"
              ? t("confirmPauseTask", { taskName: taskToPauseResume?.name })
              : t("confirmResumeTask", { taskName: taskToPauseResume?.name })}
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setPauseResumeModalOpen(false);
                setTaskToPauseResume(null);
                setPauseResumeAction("");
              }}
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleConfirmPauseResume}
              variant={pauseResumeAction === "pause" ? "warning" : "primary"}
              className="flex items-center gap-2"
            >
              {pauseResumeAction === "pause" ? t("pause") : t("resume")}
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