// src/components/Projects/TaskBoard.jsx
import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Circle, AlertCircle, CheckCircle2 } from "lucide-react";
import TaskColumn from "./TaskColumn";
import TaskCard from "./TaskCard";
import TaskModal from "../TaskModal";
import Button from "../../../../../components/UI/Button"; // Fixed import path

const TaskBoard = ({ 
  tasks, 
  onTaskUpdate, 
  onTaskDelete, 
  onTaskCreate, 
  projectId, 
  isRTL = false 
}) => {
  const { t } = useTranslation();
  const [draggedTask, setDraggedTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Helper functions for status conversion
  const getApiStatus = useCallback((numericStatus) => {
    const statusMap = {
      0: "Underimplementation", // pending -> Underimplementation
      1: "Underimplementation", // inProgress -> Underimplementation  
      2: "Complete"             // completed -> Complete
    };
    return statusMap[numericStatus] || "Underimplementation";
  }, []);

  const getNumericStatus = useCallback((apiStatus) => {
    const statusMap = {
      "Underimplementation": 1, // Map to inProgress (1)
      "Complete": 2,            // Map to completed (2)
      "Pause": 0,               // Map to pending (0)
      "Notimplemented": 0       // Map to pending (0)
    };
    return statusMap[apiStatus] || 1; // Default to inProgress
  }, []);

  // Categorize tasks by status - handle both numeric and string statuses
  const pendingTasks = tasks.filter(task => {
    if (typeof task.status === 'number') {
      return task.status === 0;
    }
    return task.status === "Pause" || task.status === "Notimplemented";
  });

  const inProgressTasks = tasks.filter(task => {
    if (typeof task.status === 'number') {
      return task.status === 1;
    }
    return task.status === "Underimplementation";
  });

  const completedTasks = tasks.filter(task => {
    if (typeof task.status === 'number') {
      return task.status === 2;
    }
    return task.status === "Complete";
  });

  const handleDragStart = useCallback((e, task) => {
    setDraggedTask(task);
    e.dataTransfer.setData('text/plain', task.id.toString());
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTask(null);
  }, []);

  const handleDragOver = useCallback((e, status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e, newNumericStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newNumericStatus) {
      // Convert numeric status to API enum before updating
      const apiStatus = getApiStatus(newNumericStatus);
      onTaskUpdate(draggedTask.id, { status: apiStatus });
    }
    setDraggedTask(null);
  }, [draggedTask, onTaskUpdate, getApiStatus]);

  const handleEditTask = useCallback((task) => {
    setEditingTask(task);
    setModalOpen(true);
  }, []);

  const handleDeleteTask = useCallback((task) => {
    onTaskDelete(task.id);
  }, [onTaskDelete]);

  const handleSaveTask = useCallback((taskData) => {
    if (editingTask) {
      onTaskUpdate(editingTask.id, taskData);
    } else {
      onTaskCreate(taskData);
    }
    setModalOpen(false);
    setEditingTask(null);
  }, [editingTask, onTaskUpdate, onTaskCreate]);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditingTask(null);
  }, []);

  const handleAddTask = useCallback(() => {
    setEditingTask(null);
    setModalOpen(true);
  }, []);

  const columns = [
    {
      title: t("pending"),
      icon: Circle,
      color: "gray",
      status: 0,
      tasks: pendingTasks
    },
    {
      title: t("inProgress"),
      icon: AlertCircle,
      color: "yellow",
      status: 1,
      tasks: inProgressTasks
    },
    {
      title: t("completed"),
      icon: CheckCircle2,
      color: "green",
      status: 2,
      tasks: completedTasks
    }
  ];

  return (
    <div className="bg-gradient-to-br from-white/50 to-gray-50/30 dark:from-gray-800/50 dark:to-gray-700/30 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-600/50 backdrop-blur-sm">
      {/* Header */}
      <div className={`flex items-center justify-between mb-6 ${isRTL ? "flex-row-reverse" : ""}`}>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {t("taskBoard")}
        </h2>
        <Button
          onClick={handleAddTask}
          className={`flex items-center gap-2 !w-auto px-4 py-2 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <Plus size={20} />
          <span>{t("addTask")}</span>
        </Button>
      </div>

      {/* Task Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <TaskColumn
            key={column.status}
            title={column.title}
            icon={column.icon}
            color={column.color}
            status={column.status}
            taskCount={column.tasks.length}
            onDragOver={handleDragOver}
            onDragLeave={() => {}}
            onDrop={handleDrop}
            isRTL={isRTL}
          >
            {column.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                isRTL={isRTL}
              />
            ))}
          </TaskColumn>
        ))}
      </div>

      {/* Task Modal */}
      <TaskModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        task={editingTask}
        projectId={projectId}
        isRTL={isRTL}
      />
    </div>
  );
};

export default TaskBoard;