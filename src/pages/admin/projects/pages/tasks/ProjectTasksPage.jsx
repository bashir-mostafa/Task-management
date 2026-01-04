// src/pages/admin/projects/pages/ProjectTasksPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
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
  BarChart3,
  UserPlus,
  Pause,
  Play,
  Eye,
} from "lucide-react";
import { taskService } from "../../services/taskService";
import { projectService } from "../../services/projectService";

import DataTableLayout from "../../../../../components/Layout/DataTableLayout";
import DetailsCard from "../../../../../components/UI/DetailsCard";
import StatCard from "../../../../../components/UI/StatCard";
import ProgressBar from "../../../../../components/UI/ProgressBar";
import Button from "../../../../../components/UI/Button";
import Modal from "../../../../../components/UI/Modal";
import Input from "../../../../../components/UI/InputField";
import TextArea from "../../../../../components/UI/TextAreaField";
import Select from "../../../../../components/UI/Select";
import DeleteConfirmationModal from "../../../../../components/UI/DeleteConfirmationModal";
import Toast from "../../../../../components/Toast";

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

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isPauseResumeModalOpen, setIsPauseResumeModalOpen] = useState(false);
  const [taskToPauseResume, setTaskToPauseResume] = useState(null);
  const [pauseResumeAction, setPauseResumeAction] = useState("");

  // Form states
  const [taskForm, setTaskForm] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: 1,
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
      "Notimplemented": <Clock size={16} className="text-gray-600" />,
      "Underimplementation": <AlertCircle size={16} className="text-blue-600" />,
      "Complete": <CheckCircle size={16} className="text-green-600" />,
      "Pause": <Pause size={16} className="text-orange-600" />,
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
        task.description.toLowerCase().includes(searchTerm.toLowerCase());

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

  // Form handlers
  const resetForm = useCallback(() => {
    setTaskForm({
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      status: 1,
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
        evaluation_admin: parseInt(taskForm.evaluation_admin),
      };

      await taskService.createTask(taskData);

      showToast(t("taskCreatedSuccessfully"), "success");
      setIsCreateModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("createError");
      showToast(errorMessage, "error");
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
      status: taskService.getStatusNumber(task.status),
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
        project_id: parseInt(projectId),
        evaluation_admin: parseInt(taskForm.evaluation_admin),
      };

      await taskService.updateTask(selectedTask.id, taskData);

      showToast(t("taskUpdatedSuccessfully"), "success");
      setIsEditModalOpen(false);
      setSelectedTask(null);
      resetForm();
      fetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("updateError");
      showToast(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  }, [
    taskForm,
    selectedTask,
    projectId,
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
      fetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || t("deleteError");
      showToast(errorMessage, "error");
    }
  }, [taskToDelete, t, showToast, fetchData]);

  const handlePauseTask = useCallback((task) => {
    setTaskToPauseResume(task);
    setPauseResumeAction("pause");
    setIsPauseResumeModalOpen(true);
  }, []);

  const handleResumeTask = useCallback((task) => {
    setTaskToPauseResume(task);
    setPauseResumeAction("resume");
    setIsPauseResumeModalOpen(true);
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

      setIsPauseResumeModalOpen(false);
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
      navigate(
        `/projects/${projectId}/tasks/${task.id}/assign-users`
      );
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

  // Memoized statistics
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
      onAddClick={() => setIsCreateModalOpen(true)}
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
      isEmpty={currentTasks.length === 0}
      emptyMessage={
        searchTerm || statusFilter !== "all"
          ? t("noTasksMatchFilters")
          : t("noTasksInProject")
      }
      emptyAction={{
        label: t("createFirstTask"),
        onClick: () => handleAddTask(),
      }}
      isRTL={isRTL}
      hiddenStats={true}
      projectId={projectId}
    >
      {/* Tasks Table */}
      <DetailsCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20">
                <th className="py-4 px-6 text-left font-semibold text-gray-600 dark:text-gray-300">
                  {t("taskName")}
                </th>
                <th className="py-4 px-6 text-left font-semibold text-gray-600 dark:text-gray-300">
                  {t("status")}
                </th>
                <th className="py-4 px-6 text-left font-semibold text-gray-600 dark:text-gray-300">
                  {t("dates")}
                </th>
                <th className="py-4 px-6 text-left font-semibold text-gray-600 dark:text-gray-300">
                  {t("evaluation")}
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
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div>
                      <button
                        onClick={() => handleViewTask(task.id)}
                        className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 text-left"
                      >
                        {task.name}
                      </button>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {task.description}
                      </div>
                      {task.create_by && (
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                          <User size={12} />
                          {t("createdBy")}: {task.create_by}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${
                        statusColors[task.status] || statusColors.Notimplemented
                      }`}
                    >
                      {statusIcons[task.status]}
                      {t(getStatusText(task.status))}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300">
                          {new Date(task.start_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300">
                          {new Date(task.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-20">
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
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleViewTask(task.id)}
                        variant="ghost"
                        size="sm"
                        className="p-2"
                        title={t("view")}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleAssignUsers(task)}
                        variant="ghost"
                        size="sm"
                        className="p-2 text-purple-600"
                        title={t("assignUsers")}
                      >
                        <UserPlus size={14} />
                      </button>
                      {task.status === "Underimplementation" && (
                        <button
                          onClick={() => handlePauseTask(task)}
                          variant="ghost"
                          size="sm"
                          className="p-2 text-orange-600"
                          title={t("pauseTask")}
                        >
                          <Pause size={14} />
                        </button>
                      )}
                      {task.status === "Pause" && (
                        <button
                          onClick={() => handleResumeTask(task)}
                          variant="ghost"
                          size="sm"
                          className="p-2 text-green-600"
                          title={t("resumeTask")}
                        >
                          <Play size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleEditTask(task)}
                        variant="ghost"
                        size="sm"
                        className="p-2 text-blue-600"
                        title={t("edit")}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(task)}
                        variant="ghost"
                        size="sm"
                        className="p-2 text-red-600"
                        title={t("delete")}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DetailsCard>

    

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

      {/* Pause/Resume Confirmation Modal */}
      <Modal
        isOpen={isPauseResumeModalOpen}
        onClose={() => {
          setIsPauseResumeModalOpen(false);
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
                setIsPauseResumeModalOpen(false);
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