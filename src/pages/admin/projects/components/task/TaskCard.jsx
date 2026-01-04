// src/components/Projects/TaskCard.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  GripVertical,
  Edit,
  Trash2,
  Calendar,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
} from "lucide-react";

const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  isRTL = false,
}) => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = {
    0: {
      icon: Circle,
      color: "text-gray-500 bg-gray-100 dark:bg-gray-700",
      label: t("pending"),
    },
    1: {
      icon: AlertCircle,
      color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30",
      label: t("inProgress"),
    },
    2: {
      icon: CheckCircle2,
      color: "text-green-600 bg-green-100 dark:bg-green-900/30",
      label: t("completed"),
    },
  };

  const StatusIcon = statusConfig[task.status]?.icon || Circle;
  const statusColor =
    statusConfig[task.status]?.color || "text-gray-500 bg-gray-100";
  const statusLabel = statusConfig[task.status]?.label || t("pending");

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(task);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(task);
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-600 
        p-4 shadow-sm hover:shadow-xl transition-all duration-300 cursor-grab active:cursor-grabbing
        hover:scale-105 hover:border-primary/50 backdrop-blur-sm
        ${isHovered ? "ring-2 ring-primary/20" : ""}
      `}>
      {/* Drag Handle */}
      <div
        className={`absolute top-3 ${
          isRTL ? "left-3" : "right-3"
        } opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-grab`}>
        <GripVertical size={16} className="text-gray-400" />
      </div>

      {/* Action Buttons */}
      <div
        className={`absolute top-3 ${
          isRTL ? "right-3" : "left-3"
        } flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200`}>
        <button
          onClick={handleEdit}
          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
          title={t("edit")}>
          <Edit size={14} />
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
          title={t("delete")}>
          <Trash2 size={14} />
        </button>
      </div>

      {/* Status Badge */}
      <div
        className={`flex items-center gap-2 mb-3 ${
          isRTL ? "flex-row-reverse justify-end" : ""
        }`}>
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center ${statusColor}`}>
          <StatusIcon size={12} />
        </div>
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
          {statusLabel}
        </span>
      </div>

      {/* Task Content */}
      <div className="space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight pr-8">
          {task.name}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-gray-600 dark:text-gray-300 text-xs line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Metadata */}
        <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          {/* Dates */}
          <div
            className={`flex items-center justify-between text-xs ${
              isRTL ? "flex-row-reverse" : ""
            }`}>
            <div
              className={`flex items-center gap-1 text-gray-500 dark:text-gray-400 ${
                isRTL ? "flex-row-reverse" : ""
              }`}>
              <Calendar size={12} />
              <span>
                {new Date(
                  task.start_date || task.startdate || task.startDate
                ).toLocaleDateString()}
              </span>
            </div>
            <div
              className={`flex items-center gap-1 text-gray-500 dark:text-gray-400 ${
                isRTL ? "flex-row-reverse" : ""
              }`}>
              <Clock size={12} />
              <span>
                {new Date(
                  task.end_date || task.enddate || task.endDate
                ).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Assignee */}
          {task.username && (
            <div
              className={`flex items-center gap-2 text-xs ${
                isRTL ? "flex-row-reverse justify-end" : ""
              }`}>
              <User size={12} className="text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300 truncate">
                {task.username}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export default TaskCard; // تأكد من وجود هذا السطر
