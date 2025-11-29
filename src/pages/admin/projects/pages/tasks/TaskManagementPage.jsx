// src/pages/admin/projects/pages/TaskManagementPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Calendar,
  User,
  Target,
  FileText,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Users,
  UserPlus,
} from "lucide-react";
import { taskService } from "../../services/taskService";
import { projectService } from "../../services/projectService";
import useDarkMode from "../../../../../hooks/useDarkMode";
import Button from "../../../../../components/UI/Button";
import Modal from "../../../../../components/UI/Modal";
import Input from "../../../../../components/UI/InputField";
import TextArea from "../../../../../components/UI/TextAreaField";
import Select from "../../../../../components/UI/Select";
import Pagination from "../../../../../components/UI/Pagination";
import DeleteConfirmationModal from "../../../../../components/UI/DeleteConfirmationModal";
import Toast from "../../../../../components/Toast";

export default function TaskManagementPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isDark } = useDarkMode();

  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(10);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Form states
  const [taskForm, setTaskForm] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: 1,
    success_rate: 0,
    user_id: "",
    evaluation_admin: 0,
    notes_admin: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const isRTL = i18n.language === "ar";

  // Memoized status configuration
  const statusMap = useMemo(
    () => ({
      0: "pending",
      1: "inProgress",
      2: "completed",
    }),
    []
  );

  const statusColors = useMemo(
    () => ({
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800",
      inProgress:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
      completed:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800",
    }),
    []
  );

  const statusIcons = useMemo(
    () => ({
      pending: <Clock size={16} className="text-yellow-600" />,
      inProgress: <AlertCircle size={16} className="text-blue-600" />,
      completed: <CheckCircle size={16} className="text-green-600" />,
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
    (statusNumber) => {
      return statusMap[statusNumber] || "pending";
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
      setTasks(tasksResult.project.task);
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("fetchError");
      setError(errorMessage);
      showToast(errorMessage, "error");
      console.error("Error fetching data:", error);
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
        task.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || task.status.toString() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchTerm, statusFilter]);

  // Pagination
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  // Form handlers
  const resetForm = useCallback(() => {
    setTaskForm({
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      status: 1,
      success_rate: 0,
      user_id: "",
      evaluation_admin: 0,
      notes_admin: "",
    });
    setFormErrors({});
  }, []);

  const handleInputChange = useCallback(
    (field, value) => {
      setTaskForm((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear error when user starts typing
      if (formErrors[field]) {
        setFormErrors((prev) => ({
          ...prev,
          [field]: "",
        }));
      }
    },
    [formErrors]
  );

  const validateForm = useCallback(() => {
    const errors = {};

    if (!taskForm.name.trim()) {
      errors.name = t("taskNameRequired");
    }

    if (!taskForm.description.trim()) {
      errors.description = t("taskDescriptionRequired");
    }

    if (!taskForm.start_date) {
      errors.start_date = t("startDateRequired");
    }

    if (!taskForm.end_date) {
      errors.end_date = t("endDateRequired");
    }

    if (taskForm.start_date && taskForm.end_date) {
      const startDate = new Date(taskForm.start_date);
      const endDate = new Date(taskForm.end_date);

      if (endDate < startDate) {
        errors.end_date = t("endDateAfterStartDate");
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [taskForm, t]);

  // Task operations
  const handleCreateTask = useCallback(async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const taskData = {
        ...taskForm,
        project_id: parseInt(projectId),
        success_rate: parseInt(taskForm.success_rate),
        evaluation_admin: parseInt(taskForm.evaluation_admin),
      };

      await taskService.createTask(taskData);

      showToast(t("taskCreatedSuccessfully"), "success");
      setIsCreateModalOpen(false);
      resetForm();
      fetchData(); // Refresh the list
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("createError");
      showToast(errorMessage, "error");
      console.error("Error creating task:", error);
    } finally {
      setSubmitting(false);
    }
  }, [taskForm, projectId, validateForm, t, showToast, resetForm, fetchData]);

  const handleEditTask = useCallback((task) => {
    setSelectedTask(task);
    setTaskForm({
      name: task.name,
      description: task.description,
      start_date: task.start_date?.split("T")[0] || "",
      end_date: task.end_date?.split("T")[0] || "",
      status: task.status,
      success_rate: task.success_rate || 0,
      user_id: task.user_id || "",
      evaluation_admin: task.evaluation_admin || 0,
      notes_admin: task.notes_admin || "",
    });
    setIsEditModalOpen(true);
  }, []);

  const handleUpdateTask = useCallback(async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const taskData = {
        ...taskForm,
        success_rate: parseInt(taskForm.success_rate),
        evaluation_admin: parseInt(taskForm.evaluation_admin),
      };

      await taskService.updateTask(selectedTask.id, taskData);

      showToast(t("taskUpdatedSuccessfully"), "success");
      setIsEditModalOpen(false);
      setSelectedTask(null);
      resetForm();
      fetchData(); // Refresh the list
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("updateError");
      showToast(errorMessage, "error");
      console.error("Error updating task:", error);
    } finally {
      setSubmitting(false);
    }
  }, [
    taskForm,
    selectedTask,
    validateForm,
    t,
    showToast,
    resetForm,
    fetchData,
  ]);

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
      fetchData(); // Refresh the list
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("deleteError");
      showToast(errorMessage, "error");
      console.error("Error deleting task:", error);
    }
  }, [taskToDelete, t, showToast, fetchData]);

  const handleAssignUsers = useCallback(
    (task) => {
      navigate(
        `/dashboard/projects/${projectId}/tasks/${task.id}/assign-users`
      );
    },
    [navigate, projectId]
  );

  // Navigation handlers
  const handleBackToProject = useCallback(() => {
    navigate(`/dashboard/projects/${projectId}`);
  }, [navigate, projectId]);

  // Memoized statistics
  const statistics = useMemo(() => {
    const completedTasks = tasks.filter((task) => task.status === 2).length;
    const inProgressTasks = tasks.filter((task) => task.status === 1).length;
    const pendingTasks = tasks.filter((task) => task.status === 0).length;

    return {
      completedTasks,
      inProgressTasks,
      pendingTasks,
      totalTasks: tasks.length,
      completionRate:
        tasks.length > 0
          ? Math.round((completedTasks / tasks.length) * 100)
          : 0,
    };
  }, [tasks]);

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

  if (error || !project) {
    return (
      <div className="min-h-screen p-6 bg-background">
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4" aria-hidden="true">
            ❌
          </div>
          <h2 className="text-2xl font-bold text-text mb-4">
            {error || t("projectNotFound")}
          </h2>
          <Button onClick={handleBackToProject} className="!w-auto px-6 py-3">
            {t("backToProject")}
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
            onClick={handleBackToProject}
            variant="secondary"
            className={`flex items-center gap-2 !w-auto px-4 py-2 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
            aria-label={t("backToProject")}>
            <ArrowLeft size={20} />
            <span>{t("backToProject")}</span>
          </Button>

          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t("taskManagement")} - {project.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {project.description}
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className={`flex items-center gap-2 !w-auto px-4 py-2 ${
            isRTL ? "flex-row-reverse" : ""
          }`}>
          <Plus size={20} />
          <span>{t("addTask")}</span>
        </Button>
      </header>

      {/* Stats Grid */}
      <section
        aria-label="Task statistics"
        className="grid grid-cols-4 gap-6 mb-8">
        <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/30">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {statistics.totalTasks}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {t("totalTasks")}
          </div>
        </div>
        <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200/50 dark:border-green-700/30">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {statistics.completedTasks}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {t("completed")}
          </div>
        </div>
        <div className="text-center p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border border-yellow-200/50 dark:border-yellow-700/30">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {statistics.inProgressTasks}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {t("inProgress")}
          </div>
        </div>
        <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/30">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {statistics.completionRate}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {t("completionRate")}
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <div
        className={`bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-lg border border-gray-200/50 dark:border-gray-600/50 ${
          isRTL ? "text-right" : ""
        }`}>
        <div
          className={`flex items-center gap-4 ${
            isRTL ? "flex-row-reverse" : ""
          }`}>
          <div className="flex-1">
            <div className="relative">
              <Search
                size={20}
                className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 ${
                  isRTL ? "right-3" : "left-3"
                }`}
              />
              <Input
                type="text"
                placeholder={t("searchTasks")}
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

      {/* Tasks Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-600/50 overflow-hidden">
        {currentTasks.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
              {t("noTasksFound")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || statusFilter !== "all"
                ? t("noTasksMatchFilters")
                : t("noTasksInProject")}
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              {t("createFirstTask")}
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="py-4 px-6 text-left font-semibold text-gray-600 dark:text-gray-300">
                      {t("taskName")}
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
                      {t("progress")}
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-600 dark:text-gray-300">
                      {t("assignedTo")}
                    </th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-600 dark:text-gray-300">
                      {t("actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentTasks.map((task) => (
                    <tr
                      key={task.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {task.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {task.description}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${
                            statusColors[getStatusText(task.status)] ||
                            statusColors.pending
                          }`}>
                          {statusIcons[getStatusText(task.status)]}
                          {t(getStatusText(task.status))}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">
                        {new Date(task.start_date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">
                        {new Date(task.end_date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${task.success_rate}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {task.success_rate}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">
                        {task.username || t("unassigned")}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAssignUsers(task)}
                            className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                            title={t("assignUsers")}>
                            <UserPlus size={16} />
                          </button>
                          <button
                            onClick={() => handleEditTask(task)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title={t("edit")}>
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(task)}
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

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title={t("addNewTask")}
        size="lg">
        <div className="space-y-4">
          <Input
            label={t("taskName")}
            value={taskForm.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            error={formErrors.name}
            required
          />

          <TextArea
            label={t("description")}
            value={taskForm.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            error={formErrors.description}
            rows={4}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label={t("startDate")}
              value={taskForm.start_date}
              onChange={(e) => handleInputChange("start_date", e.target.value)}
              error={formErrors.start_date}
              required
            />

            <Input
              type="date"
              label={t("endDate")}
              value={taskForm.end_date}
              onChange={(e) => handleInputChange("end_date", e.target.value)}
              error={formErrors.end_date}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label={t("status")}
              value={taskForm.status}
              onChange={(e) =>
                handleInputChange("status", parseInt(e.target.value))
              }>
              <option value={0}>{t("pending")}</option>
              <option value={1}>{t("inProgress")}</option>
              <option value={2}>{t("completed")}</option>
            </Select>

            <Input
              type="number"
              label={t("successRate")}
              value={taskForm.success_rate}
              onChange={(e) =>
                handleInputChange("success_rate", e.target.value)
              }
              min="0"
              max="100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label={t("evaluation")}
              value={taskForm.evaluation_admin}
              onChange={(e) =>
                handleInputChange("evaluation_admin", e.target.value)
              }
              min="0"
              max="10"
            />

            <Input
              label={t("assignedUser")}
              value={taskForm.user_id}
              onChange={(e) => handleInputChange("user_id", e.target.value)}
              placeholder="User ID"
            />
          </div>

          <TextArea
            label={t("adminNotes")}
            value={taskForm.notes_admin}
            onChange={(e) => handleInputChange("notes_admin", e.target.value)}
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetForm();
              }}
              disabled={submitting}>
              {t("cancel")}
            </Button>
            <Button
              onClick={handleCreateTask}
              disabled={submitting}
              className="flex items-center gap-2">
              {submitting ? t("creating") : t("createTask")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTask(null);
          resetForm();
        }}
        title={t("editTask")}
        size="lg">
        <div className="space-y-4">
          <Input
            label={t("taskName")}
            value={taskForm.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            error={formErrors.name}
            required
          />

          <TextArea
            label={t("description")}
            value={taskForm.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            error={formErrors.description}
            rows={4}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label={t("startDate")}
              value={taskForm.start_date}
              onChange={(e) => handleInputChange("start_date", e.target.value)}
              error={formErrors.start_date}
              required
            />

            <Input
              type="date"
              label={t("endDate")}
              value={taskForm.end_date}
              onChange={(e) => handleInputChange("end_date", e.target.value)}
              error={formErrors.end_date}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label={t("status")}
              value={taskForm.status}
              onChange={(e) =>
                handleInputChange("status", parseInt(e.target.value))
              }>
              <option value={0}>{t("pending")}</option>
              <option value={1}>{t("inProgress")}</option>
              <option value={2}>{t("completed")}</option>
            </Select>

            <Input
              type="number"
              label={t("successRate")}
              value={taskForm.success_rate}
              onChange={(e) =>
                handleInputChange("success_rate", e.target.value)
              }
              min="0"
              max="100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label={t("evaluation")}
              value={taskForm.evaluation_admin}
              onChange={(e) =>
                handleInputChange("evaluation_admin", e.target.value)
              }
              min="0"
              max="10"
            />

            <Input
              label={t("assignedUser")}
              value={taskForm.user_id}
              onChange={(e) => handleInputChange("user_id", e.target.value)}
              placeholder="User ID"
            />
          </div>

          <TextArea
            label={t("adminNotes")}
            value={taskForm.notes_admin}
            onChange={(e) => handleInputChange("notes_admin", e.target.value)}
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedTask(null);
                resetForm();
              }}
              disabled={submitting}>
              {t("cancel")}
            </Button>
            <Button
              onClick={handleUpdateTask}
              disabled={submitting}
              className="flex items-center gap-2">
              {submitting ? t("updating") : t("updateTask")}
            </Button>
          </div>
        </div>
      </Modal>

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
export { TaskManagementPage };
