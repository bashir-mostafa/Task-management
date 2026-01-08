import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  User,
  Target,
  Edit,
  Trash2,
  FileText,
  PlayCircle,
  CheckCircle,
  PauseCircle,
  XCircle,
  Clock,
  AlertCircle,
  BarChart,
  Users,
} from "lucide-react";

const TaskCard = ({
  task,
  viewMode,
  isSelected,
  onSelect,
  onEdit,
  isBulkMode = false,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Status configuration
  const statusConfig = {
    "Notimplemented": {
      text: t("notImplemented"),
      color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border border-gray-200 dark:border-gray-800",
      icon: <Clock size={14} className="text-gray-600 dark:text-gray-400" />,
      bgColor: "bg-gray-50 dark:bg-gray-800/50",
      textColor: "text-gray-700 dark:text-gray-300"
    },
    "Underimplementation": {
      text: t("underImplementation"),
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
      icon: <AlertCircle size={14} className="text-blue-600 dark:text-blue-400" />,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-700 dark:text-blue-300"
    },
    "Complete": {
      text: t("completed"),
      color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800",
      icon: <CheckCircle size={14} className="text-green-600 dark:text-green-400" />,
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-700 dark:text-green-300"
    },
    "Pause": {
      text: t("paused"),
      color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800",
      icon: <PauseCircle size={14} className="text-orange-600 dark:text-orange-400" />,
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      textColor: "text-orange-700 dark:text-orange-300"
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getProgressTextColor = (progress) => {
    if (progress >= 80) return "text-green-600 dark:text-green-400";
    if (progress >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  // Calculate progress based on evaluation (0-5 scale)
  const progress = task.evaluation_admin ? (task.evaluation_admin / 5) * 100 : 0;
  
  // Handle task click
  const handleTaskClick = () => {
    if (!isBulkMode && task.project_id) {
      navigate(`/projects/${task.project_id}/tasks/${task.id}`);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return t("notSet");
    return new Date(dateString).toLocaleDateString();
  };

  if (viewMode === "list") {
    return (
      <div
        className={`task-card-theme group ${
          isSelected ? "task-card-selected" : "task-card-hover"
        } ${isBulkMode ? "cursor-default" : "cursor-pointer"}`}
        onClick={handleTaskClick}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {/* Optional: Add checkbox for selection */}
              {/* <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelect && onSelect(task.id, e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
              /> */}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <FileText
                      size={20}
                      className="text-primary flex-shrink-0"
                    />
                    <button
                      onClick={handleTaskClick}
                      className={`text-lg font-semibold text-gray-800 dark:text-white transition-colors text-left truncate ${
                        isBulkMode ? "cursor-default" : "hover:text-primary"
                      }`}>
                      {task.name}
                    </button>
                  </div>
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 flex-shrink-0 ${
                      statusConfig[task.status]?.color || statusConfig.Notimplemented.color
                    }`}>
                    {statusConfig[task.status]?.icon || <Clock size={14} />}
                    {statusConfig[task.status]?.text || t("notImplemented")}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {task.description || t("noDescription")}
                </p>

                <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                  {task.start_date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar
                        size={16}
                        className="text-gray-400 dark:text-gray-500"
                      />
                      <span>
                        {t("start")}: {formatDate(task.start_date)}
                      </span>
                    </div>
                  )}
                  
                  {task.end_date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar
                        size={16}
                        className="text-gray-400 dark:text-gray-500"
                      />
                      <span>
                        {t("end")}: {formatDate(task.end_date)}
                      </span>
                    </div>
                  )}
                  
                  {task.create_by && (
                    <div className="flex items-center gap-1.5">
                      <User
                        size={16}
                        className="text-gray-400 dark:text-gray-500"
                      />
                      <span>{task.create_by}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 ml-4">
              {/* Evaluation/Progress */}
              <div className="w-32">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("evaluation")}
                  </span>
                  <span className={`font-medium ${getProgressTextColor(progress)}`}>
                    {task.evaluation_admin || 0}/5
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(progress)}`}
                    style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div
      className={`task-card-theme group ${
        isSelected ? "task-card-selected" : "task-card-hover"
      } ${isBulkMode ? "cursor-default" : "cursor-pointer"}`}
      onClick={handleTaskClick}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <FileText
                  size={20}
                  className="text-primary flex-shrink-0"
                />
                <button
                  onClick={handleTaskClick}
                  className={`text-lg font-semibold text-gray-800 dark:text-white transition-colors text-left truncate ${
                    isBulkMode ? "cursor-default" : "hover:text-primary"
                  }`}>
                  {task.name}
                </button>
              </div>
            </div>
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${
                statusConfig[task.status]?.color || statusConfig.Notimplemented.color
              }`}>
              {statusConfig[task.status]?.icon || <Clock size={14} />}
              {statusConfig[task.status]?.text || t("notImplemented")}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
          {task.description || t("noDescription")}
        </p>

        {/* Progress/Evaluation */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">
              {t("evaluation")}
            </span>
            <span className={`font-medium ${getProgressTextColor(progress)}`}>
              {task.evaluation_admin || 0}/5
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(progress)}`}
              style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3 text-sm">
          {task.start_date && (
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <Calendar
                size={16}
                className="text-gray-400 dark:text-gray-500 flex-shrink-0"
              />
              <span className="truncate">
                {t("starts")}: {formatDate(task.start_date)}
              </span>
            </div>
          )}
          
          {task.end_date && (
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <Calendar
                size={16}
                className="text-gray-400 dark:text-gray-500 flex-shrink-0"
              />
              <span className="truncate">
                {t("ends")}: {formatDate(task.end_date)}
              </span>
            </div>
          )}
          
          {task.create_by && (
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <User
                size={16}
                className="text-gray-400 dark:text-gray-500 flex-shrink-0"
              />
              <span className="truncate">
                {task.create_by}
              </span>
            </div>
          )}
        </div>

        {/* Success Rate if available */}
        {task.success_rate > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target size={14} className="text-gray-400" />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {t("successRate")}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-white">
                {task.success_rate}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;