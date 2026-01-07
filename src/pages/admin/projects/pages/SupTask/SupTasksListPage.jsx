// src/pages/admin/projects/pages/tasks/SupTasksListPage.jsx
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
  UserCheck,
  Eye,
  ChevronRight,
  FileText,
  Loader,
  Pause,
  Play
} from "lucide-react";
import { supTaskService } from "../../services/supTaskService";
import { taskService } from "../../services/taskService";
import DataTableLayout from "../../../../../components/Layout/DataTableLayout";
import ProgressBar from "../../../../../components/UI/ProgressBar";
import Button from "../../../../../components/UI/Button";
import DeleteConfirmationModal from "../../../../../components/UI/DeleteConfirmationModal";
import Toast from "../../../../../components/Toast";
import Pagination from "../../../../../components/UI/Pagination";

export default function SupTasksListPage() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [supTasks, setSupTasks] = useState([]);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [supTasksPerPage] = useState(10);
  const [selectedSupTasks, setSelectedSupTasks] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [supTaskToDelete, setSupTaskToDelete] = useState(null);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [pauseResumeModalOpen, setPauseResumeModalOpen] = useState(false);
  const [supTaskToPauseResume, setSupTaskToPauseResume] = useState(null);
  const [pauseResumeAction, setPauseResumeAction] = useState("");

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const isRTL = i18n.language === "ar";

  // Status configuration - نفس حالات المهام
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

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch parent task details
      const taskData = await taskService.getTaskById(taskId);
      setTask(taskData);

      // Fetch sub tasks
      const supTasksResult = await supTaskService.getSupTasksByTask(taskId);
      setSupTasks(supTasksResult.data || []);
      setSelectedSupTasks([]); // Reset selected tasks
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("fetchError");
      setError(errorMessage);
      showToast(errorMessage, "error");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [taskId, t, showToast]);

  useEffect(() => {
    if (taskId) {
      fetchData();
    }
  }, [taskId, fetchData]);

  // Function to convert numeric status to string status
  const convertStatus = useCallback((status) => {
    // إذا كانت الحالة رقمية، قم بتحويلها إلى نصي
    if (typeof status === "number") {
      const statusMap = {
        0: "Notimplemented",
        1: "Underimplementation",
        2: "Complete"
      };
      return statusMap[status] || "Notimplemented";
    }
    // إذا كانت نصية بالفعل، تأكد أنها من الحالات المحددة
    const validStatuses = ["Notimplemented", "Underimplementation", "Complete", "Pause"];
    return validStatuses.includes(status) ? status : "Notimplemented";
  }, []);

  // Filter and search sub tasks
  const filteredSupTasks = useMemo(() => {
    return supTasks.filter((supTask) => {
      const matchesSearch =
        supTask.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supTask.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // تحويل الحالة للتأكد من المقارنة الصحيحة
      const taskStatus = convertStatus(supTask.status);
      const matchesStatus =
        statusFilter === "all" || taskStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [supTasks, searchTerm, statusFilter, convertStatus]);

  // Pagination
  const indexOfLastSupTask = currentPage * supTasksPerPage;
  const indexOfFirstSupTask = indexOfLastSupTask - supTasksPerPage;
  const currentSupTasks = filteredSupTasks.slice(indexOfFirstSupTask, indexOfLastSupTask);
  const totalPages = Math.ceil(filteredSupTasks.length / supTasksPerPage);

  // Selection handlers
  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedSupTasks(currentSupTasks.map(task => task.id));
    } else {
      setSelectedSupTasks([]);
    }
  };

  const toggleSelectSupTask = (id, checked) => {
    if (checked) {
      setSelectedSupTasks([...selectedSupTasks, id]);
    } else {
      setSelectedSupTasks(selectedSupTasks.filter(taskId => taskId !== id));
    }
  };

  // Bulk operations
  const handleBulkDeleteClick = () => {
    if (selectedSupTasks.length > 0) {
      setBulkDeleteModalOpen(true);
    }
  };

  const handleConfirmBulkDelete = async () => {
    try {
      // Delete all selected sub tasks
      for (const supTaskId of selectedSupTasks) {
        await supTaskService.deleteSupTask(supTaskId);
      }
      
      showToast(t("supTasksDeletedSuccessfully", { count: selectedSupTasks.length }), "success");
      setBulkDeleteModalOpen(false);
      setSelectedSupTasks([]);
      fetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("deleteError");
      showToast(errorMessage, "error");
    }
  };

  // Sub task operations
  const handleEditSupTask = useCallback((supTask) => {
    navigate(`/projects/${projectId}/tasks/${taskId}/subtasks/${supTask.id}/edit`);
  }, [navigate, projectId, taskId]);

  const handleDeleteClick = useCallback((supTask) => {
    setSupTaskToDelete(supTask);
    setDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    try {
      await supTaskService.deleteSupTask(supTaskToDelete.id);
      showToast(t("supTaskDeletedSuccessfully"), "success");
      setDeleteModalOpen(false);
      setSupTaskToDelete(null);
      fetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("deleteError");
      showToast(errorMessage, "error");
    }
  }, [supTaskToDelete, t, showToast, fetchData]);

  // Pause/Resume operations
  const handlePauseSupTask = useCallback((supTask) => {
    setSupTaskToPauseResume(supTask);
    setPauseResumeAction("pause");
    setPauseResumeModalOpen(true);
  }, []);

  const handleResumeSupTask = useCallback((supTask) => {
    setSupTaskToPauseResume(supTask);
    setPauseResumeAction("resume");
    setPauseResumeModalOpen(true);
  }, []);

  const handleConfirmPauseResume = useCallback(async () => {
    try {
      const statusToUpdate = pauseResumeAction === "pause" ? "Pause" : "Underimplementation";
      
      // إنشاء كائن التحديث بالحالة الجديدة
      const updatedData = {
        ...supTaskToPauseResume,
        status: statusToUpdate
      };

      await supTaskService.updateSupTask(supTaskToPauseResume.id, updatedData);
      
      showToast(
        pauseResumeAction === "pause" 
          ? t("supTaskPausedSuccessfully") 
          : t("supTaskResumedSuccessfully"), 
        "success"
      );
      
      setPauseResumeModalOpen(false);
      setSupTaskToPauseResume(null);
      setPauseResumeAction("");
      fetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("actionError");
      showToast(errorMessage, "error");
    }
  }, [pauseResumeAction, supTaskToPauseResume, t, showToast, fetchData]);

  const handleViewDetails = useCallback((supTaskId) => {
    navigate(`/projects/${projectId}/tasks/${taskId}/subtasks/${supTaskId}`);
  }, [navigate, projectId, taskId]);

  const handleCreateSupTask = useCallback(() => {
    navigate(`/projects/${projectId}/tasks/${taskId}/subtasks/create`);
  }, [navigate, projectId, taskId]);

  // Statistics
  const statistics = useMemo(() => {
    const completedTasks = supTasks.filter((task) => 
      convertStatus(task.status) === "Complete"
    ).length;
    
    const inProgressTasks = supTasks.filter((task) => 
      convertStatus(task.status) === "Underimplementation"
    ).length;
    
    const pendingTasks = supTasks.filter((task) => 
      convertStatus(task.status) === "Notimplemented"
    ).length;
    
    const pausedTasks = supTasks.filter((task) => 
      convertStatus(task.status) === "Pause"
    ).length;

    return {
      completedTasks,
      inProgressTasks,
      pendingTasks,
      pausedTasks,
      totalTasks: supTasks.length,
      completionRate:
        supTasks.length > 0
          ? Math.round((completedTasks / supTasks.length) * 100)
          : 0,
    };
  }, [supTasks, convertStatus]);

  // Table rendering
  const renderSupTasksTable = () => {
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
                    checked={currentSupTasks.length > 0 && selectedSupTasks.length === currentSupTasks.length}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                  />
                </th>
                <th className={`px-4 py-4 text-sm font-medium text-navbar-text-light dark:text-navbar-text-dark ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('supTaskName')}
                </th>
                <th className={`px-4 py-4 text-sm font-medium text-navbar-text-light dark:text-navbar-text-dark ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('status')}
                </th>
                <th className={`px-4 py-4 text-sm font-medium text-navbar-text-light dark:text-navbar-text-dark ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('dates')}
                </th>
                <th className={`px-4 py-4 text-sm font-medium text-navbar-text-light dark:text-navbar-text-dark ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('progress')}
                </th>
                <th className={`px-4 py-4 text-sm font-medium text-navbar-text-light dark:text-navbar-text-dark ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900">
              {currentSupTasks.length === 0 ? (
                <tr>
                  <td 
                    colSpan="6" 
                    className={`px-4 py-8 text-center text-gray-500 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    {searchTerm || statusFilter !== "all" ? t('noSupTasksMatchFilters') : t('noSupTasksInTask')}
                  </td>
                </tr>
              ) : (
                currentSupTasks.map((supTask) => {
                  const taskStatus = convertStatus(supTask.status);
                  return (
                    <tr 
                      key={supTask.id} 
                      className="border-b border-border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedSupTasks.includes(supTask.id)}
                          onChange={(e) => toggleSelectSupTask(supTask.id, e.target.checked)}
                          className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                        />
                      </td>
                      <td className={`px-4 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <button
                          onClick={() => handleViewDetails(supTask.id)}
                          className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 text-left flex items-center gap-2"
                        >
                          <FileText size={16} className="text-gray-400" />
                          {supTask.name}
                          <ChevronRight size={14} className="text-gray-400" />
                        </button>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {supTask.description || t('noDescription')}
                        </div>
                        {supTask.user_id && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                            <User size={12} />
                            {t("assignedTo")}: User #{supTask.user_id}
                          </div>
                        )}
                      </td>
                      <td className={`px-4 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${
                            statusColors[taskStatus] || statusColors.Notimplemented
                          }`}
                        >
                          {statusIcons[taskStatus]}
                          {t(getStatusText(taskStatus))}
                        </span>
                      </td>
                      <td className={`px-4 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-300">
                              {supTask.start_date ? new Date(supTask.start_date).toLocaleDateString() : t('notSet')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-300">
                              {supTask.end_date ? new Date(supTask.end_date).toLocaleDateString() : t('notSet')}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className={`px-4 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-24">
                              <ProgressBar
                                value={supTask.success_rate || 0}
                                height="h-2"
                                color={taskStatus === "Complete" ? "green" : 
                                       taskStatus === "Underimplementation" ? "blue" :
                                       taskStatus === "Pause" ? "orange" : "gray"}
                                showPercentage={false}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                              {supTask.success_rate || 0}%
                            </span>
                          </div>
                          {taskStatus === "Complete" && (
                            <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                              <CheckCircle size={12} />
                              {t("completed")}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className={`px-4 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <button
                            onClick={() => handleViewDetails(supTask.id)}
                            className="p-2 rounded-lg transition-colors text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                            title={t("viewDetails")}
                          >
                            <Eye size={16} />
                          </button>
                          
                          {/* Pause/Resume buttons */}
                          {taskStatus === "Underimplementation" && (
                            <button
                              onClick={() => handlePauseSupTask(supTask)}
                              className="p-2 rounded-lg transition-colors text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30"
                              title={t("pauseSupTask")}
                            >
                              <Pause size={16} />
                            </button>
                          )}
                          
                          {taskStatus === "Pause" && (
                            <button
                              onClick={() => handleResumeSupTask(supTask)}
                              className="p-2 rounded-lg transition-colors text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30"
                              title={t("resumeSupTask")}
                            >
                              <Play size={16} />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleEditSupTask(supTask)}
                            className="p-2 rounded-lg transition-colors text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30"
                            title={t("edit")}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(supTask)}
                            className="p-2 rounded-lg transition-colors text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                            title={t("delete")}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredSupTasks.length > 0 && (
          <div className="px-4 py-4 border-t border-border bg-white dark:bg-gray-900">
            <Pagination
              pagination={{
                currentPage,
                totalPages,
                totalCount: filteredSupTasks.length,
                perPage: supTasksPerPage
              }}
              onPageChange={setCurrentPage}
              itemsName="supTasks"
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
        title: "totalSupTasks",
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

  // Filters for DataTableLayout - نفس حالات المهام
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
      title={t("supTasksManagement")}
      subtitle={task ? `${t("forTask")}: ${task.name}` : ""}
      backUrl={`/projects/${projectId}/tasks/${taskId}`}
      backLabel={t("backToTask")}
      showAddButton={true}
      addButtonLabel={t("addSupTask")}
      onAddClick={handleCreateSupTask}
      showBulkDelete={selectedSupTasks.length > 0}
      onBulkDelete={handleBulkDeleteClick}
      bulkDeleteLabel={`${t("delete")} (${selectedSupTasks.length})`}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder={t("searchSupTasks")}
      filters={filters}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      stats={stats}
      loading={loading}
      error={error || (!task && !loading ? t("taskNotFound") : null)}
      isEmpty={filteredSupTasks.length === 0}
      emptyMessage={
        searchTerm || statusFilter !== "all"
          ? t("noSupTasksMatchFilters")
          : t("noSupTasksInTask")
      }
      emptyAction={{
        label: t("createFirstSupTask"),
        onClick: handleCreateSupTask,
      }}
      isRTL={isRTL}
      hiddenStats={true}
      projectId={projectId}
    >
      {renderSupTasksTable()}

      {/* Pause/Resume Confirmation Modal */}
      <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ${pauseResumeModalOpen ? '' : 'hidden'}`}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
          <h3 className="text-lg font-semibold mb-4">
            {pauseResumeAction === "pause" ? t("pauseSupTask") : t("resumeSupTask")}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {pauseResumeAction === "pause"
              ? t("confirmPauseSupTask", { taskName: supTaskToPauseResume?.name })
              : t("confirmResumeSupTask", { taskName: supTaskToPauseResume?.name })}
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setPauseResumeModalOpen(false);
                setSupTaskToPauseResume(null);
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
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSupTaskToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={supTaskToDelete?.name}
        type="supTask"
        count={1}
      />

      {/* Bulk Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        onConfirm={handleConfirmBulkDelete}
        itemName=""
        type="supTask"
        count={selectedSupTasks.length}
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
    </DataTableLayout>
  );
}