// src/components/Projects/ProjectCard.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  User,
  Target,
  Edit,
  Trash2,
  FolderOpen,
  PlayCircle,
  CheckCircle,
  PauseCircle,
  XCircle,
} from "lucide-react";

const ProjectCard = ({
  project,
  viewMode,
  isSelected,
  onSelect,
  onEdit,
  isBulkMode = false,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const statusColors = {
    planning:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
    Underimplementation:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800",
    Complete:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800",
    Pause:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800",
    Notimplemented:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800",
  };

  const statusIcons = {
    planning: <FolderOpen size={14} />,
    Underimplementation: <PlayCircle size={14} />,
    Complete: <CheckCircle size={14} />,
    Pause: <PauseCircle size={14} />,
    Notimplemented: <XCircle size={14} />,
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

  // استخدام success_rate ك progress
  const progress = project.success_rate || 0;

  // دالة للانتقال إلى صفحة المشروع
  const handleProjectClick = () => {
    if (!isBulkMode) {
      navigate(`/home/projects/${project.id}`);
    }
  };

  

  if (viewMode === "list") {
    return (
      <>
        <div
          className={`project-card-theme group ${
            isSelected ? "project-card-selected" : "project-card-hover"
          } ${isBulkMode ? "cursor-default" : "cursor-pointer"}`}
          onClick={handleProjectClick}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                {/* <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={handleSelect}
                  className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                /> */}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <FolderOpen
                        size={20}
                        className="text-primary flex-shrink-0"
                      />
                      <button
                        onClick={handleProjectClick}
                        className={`text-lg font-semibold text-gray-800 dark:text-white transition-colors text-left truncate ${
                          isBulkMode ? "cursor-default" : "hover:text-primary"
                        }`}>
                        {project.name}
                      </button>
                    </div>
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 flex-shrink-0 ${
                        statusColors[project.status] || statusColors.planning
                      }`}>
                      {statusIcons[project.status] || <FolderOpen size={14} />}
                      {t(project.status)}
                    </span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar
                        size={16}
                        className="text-gray-400 dark:text-gray-500"
                      />
                      <span>
                        {new Date(project.start_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User
                        size={16}
                        className="text-gray-400 dark:text-gray-500"
                      />
                      <span>{project.project_manager?.username || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Target
                        size={16}
                        className="text-gray-400 dark:text-gray-500"
                      />
                      <span>{project.success_rate}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 ml-4">
                <div className="w-32">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t("progress")}
                    </span>
                    <span
                      className={`font-medium ${getProgressTextColor(
                        progress
                      )}`}>
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(
                        progress
                      )}`}
                      style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Grid View
  return (
    <>
      <div
        className={`project-card-theme group ${
          isSelected ? "project-card-selected" : "project-card-hover"
        } ${isBulkMode ? "cursor-default" : "cursor-pointer"}`}
        onClick={handleProjectClick}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <FolderOpen
                    size={20}
                    className="text-primary flex-shrink-0"
                  />
                  <button
                    onClick={handleProjectClick}
                    className={`text-lg font-semibold text-gray-800 dark:text-white transition-colors text-left truncate ${
                      isBulkMode ? "cursor-default" : "hover:text-primary"
                    }`}>
                    {project.name}
                  </button>
                </div>
              </div>
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${
                  statusColors[project.status] || statusColors.planning
                }`}>
                {statusIcons[project.status] || <FolderOpen size={14} />}
                {t(project.status)}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
            {project.description}
          </p>

         

          {/* Details */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <Calendar
                size={16}
                className="text-gray-400 dark:text-gray-500 flex-shrink-0"
              />
              <span className="truncate">
                {t("starts")}:{" "}
                {new Date(project.start_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <Calendar
                size={16}
                className="text-gray-400 dark:text-gray-500 flex-shrink-0"
              />
              <span className="truncate">
                {t("ends")}: {new Date(project.end_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <User
                size={16}
                className="text-gray-400 dark:text-gray-500 flex-shrink-0"
              />
              <span className="truncate">
                {project.project_manager?.username || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectCard;
