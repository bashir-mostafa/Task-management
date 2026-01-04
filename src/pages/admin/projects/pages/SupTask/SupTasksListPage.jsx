// src/pages/admin/projects/pages/tasks/SupTasksListPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Calendar,
  User,
  FileText,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  List,
  Eye,
  UserCheck
} from "lucide-react";
import { supTaskService } from "../../services/supTaskService";
import { taskService } from "../../services/taskService";
import useDarkMode from "../../../../../hooks/useDarkMode";
import Button from "../../../../../components/UI/Button";
import Input from "../../../../../components/UI/InputField";
import Select from "../../../../../components/UI/Select";
import Pagination from "../../../../../components/UI/Pagination";
import DeleteConfirmationModal from "../../../../../components/UI/DeleteConfirmationModal";
import Toast from "../../../../../components/Toast";

export default function SupTasksListPage() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isDark } = useDarkMode();

  const [supTasks, setSupTasks] = useState([]);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [supTasksPerPage] = useState(10);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [supTaskToDelete, setSupTaskToDelete] = useState(null);

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
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // جلب تفاصيل المهمة الرئيسية
        const taskData = await taskService.getTaskById(taskId);
        setTask(taskData);

        // جلب المهام الفرعية
        const supTasksData = await supTaskService.getSupTasksByTask(taskId);
        setSupTasks(supTasksData.data || []);

      } catch (error) {
        const errorMessage = error.response?.data?.message || t("fetchError");
        setError(errorMessage);
        showToast(errorMessage, "error");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchData();
    }
  }, [taskId, t, showToast]);

  // تصفية المهام الفرعية
  const filteredSupTasks = supTasks.filter((supTask) => {
    const matchesSearch =
      supTask.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supTask.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || supTask.status?.toString() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // التقسيم إلى صفحات
  const indexOfLastSupTask = currentPage * supTasksPerPage;
  const indexOfFirstSupTask = indexOfLastSupTask - supTasksPerPage;
  const currentSupTasks = filteredSupTasks.slice(indexOfFirstSupTask, indexOfLastSupTask);
  const totalPages = Math.ceil(filteredSupTasks.length / supTasksPerPage);

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
      
      // تحديث القائمة
      const supTasksData = await supTaskService.getSupTasksByTask(taskId);
      setSupTasks(supTasksData.data || []);
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("deleteError");
      showToast(errorMessage, "error");
      console.error("Error deleting sup task:", error);
    }
  }, [supTaskToDelete, taskId, t, showToast]);

  const handleCreateSupTask = () => {
    navigate(`/projects/${projectId}/tasks/${taskId}/subtasks/create`);
  };

  const handleViewDetails = (supTaskId) => {
    navigate(`/projects/${projectId}/tasks/${taskId}/subtasks/${supTaskId}`);
  };

  const handleEditSupTask = (supTaskId) => {
    navigate(`/projects/${projectId}/tasks/${taskId}/subtasks/${supTaskId}/edit`);
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
          <Button 
            onClick={() => navigate(`/projects/${projectId}/tasks`)} 
            className="!w-auto px-6 py-3">
            {t("backToTasks")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-background text-text">
      {/* Header */}
      <div className={`flex items-center justify-between mb-8 ${isRTL ? "flex-row-reverse" : ""}`}>
        <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
          <Button
            onClick={() => navigate(`/projects/${projectId}/tasks/${taskId}`)}
            variant="secondary"
            className={`flex items-center gap-2 !w-auto px-4 py-2 ${isRTL ? "flex-row-reverse" : ""}`}
            aria-label={t("backToTask")}>
            <ArrowLeft size={20} />
            <span>{t("backToTask")}</span>
          </Button>

          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t("supTasksManagement")} - {task.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t("managingSupTasksForTask")}
            </p>
          </div>
        </div>

        <Button
          onClick={handleCreateSupTask}
          className={`flex items-center gap-2 !w-auto px-4 py-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          <Plus size={20} />
          <span>{t("addSupTask")}</span>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/30">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {supTasks.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {t("totalSupTasks")}
          </div>
        </div>
        <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200/50 dark:border-green-700/30">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {supTasks.filter(t => t.status === 2).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {t("completed")}
          </div>
        </div>
        <div className="text-center p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border border-yellow-200/50 dark:border-yellow-700/30">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {supTasks.filter(t => t.status === 1).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {t("inProgress")}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-lg border border-gray-200/50 dark:border-gray-600/50 ${isRTL ? "text-right" : ""}`}>
        <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className="flex-1">
            <div className="relative">
              <Search
                size={20}
                className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 ${isRTL ? "right-3" : "left-3"}`}
              />
              <Input
                type="text"
                placeholder={t("searchSupTasks")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 ${isRTL ? "pr-10" : ""}`}
              />
            </div>
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="!w-auto"
            icon={<Filter size={16} />}>
            <option value="all">{t("allStatuses")}</option>
            <option value="0">{t("pending")}</option>
            <option value="1">{t("inProgress")}</option>
            <option value="2">{t("completed")}</option>
          </Select>
        </div>
      </div>

      {/* Sup Tasks Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-600/50 overflow-hidden">
        {currentSupTasks.length === 0 ? (
          <div className="text-center py-12">
            <List size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
              {t("noSupTasksFound")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || statusFilter !== "all"
                ? t("noSupTasksMatchFilters")
                : t("noSupTasksInTask")}
            </p>
            <Button onClick={handleCreateSupTask}>
              {t("createFirstSupTask")}
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="py-4 px-6 text-left font-semibold text-gray-600 dark:text-gray-300">
                      {t("supTaskName")}
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-600 dark:text-gray-300">
                      {t("status")}
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-600 dark:text-gray-300">
                      {t("startDate")}
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-600 dark:text-gray-300">
                      {t("endDate")}
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-600 dark:text-gray-300">
                      {t("assignedUser")}
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-600 dark:text-gray-300">
                      {t("actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentSupTasks.map((supTask) => (
                    <tr
                      key={supTask.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {supTask.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {supTask.description}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${
                            statusColors[supTask.status] || statusColors[0]
                          }`}>
                          {statusIcons[supTask.status]}
                          {statusTexts[supTask.status]}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">
                        {supTask.start_date ? new Date(supTask.start_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">
                        {supTask.end_date ? new Date(supTask.end_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">
                        {supTask.name ? (
                          <div className="flex items-center gap-2">
                            <UserCheck size={14} />
                            <span>User #{supTask.user_id}</span>
                          </div>
                        ) : (
                          t("unassigned")
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(supTask.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title={t("viewDetails")}>
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEditSupTask(supTask.id)}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                            title={t("edit")}>
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(supTask)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title={t("delete")}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
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
    </div>
  );
}