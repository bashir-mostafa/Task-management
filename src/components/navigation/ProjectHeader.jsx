import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Menu, X, UserPlus, ListTodo, Edit } from "lucide-react";
import Button from "../../components/UI/Button";
import StatusBadge from "../helpers/StatusBadge";

export default function ProjectHeader({
  project,
  onBack,
  onToggleSidebar,
  isSidebarOpen,
  onAddUsers,
  onManageTasks,
  onEditProject,
  isRTL = false,
  isMobile = false
}) {
  const { t } = useTranslation();
  
  return (
    <header className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto`}>
        <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Button
            onClick={onBack}
            variant="secondary"
            className={`flex items-center gap-2 !w-auto px-3 py-1.5 md:px-4 md:py-2 ${
              isRTL ? 'flex-row-reverse' : ''
            }`}
            aria-label={t("backToProjects")}
          >
            <ArrowLeft size={20} />
            <span className="hidden md:inline">{t("backToProjects")}</span>
          </Button>

          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {project?.name || ""}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <StatusBadge status={project?.status} size="small" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ID: {project?.id}
              </span>
            </div>
          </div>
        </div>

        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
            aria-label={isSidebarOpen ? t("hideSidebar") : t("showSidebar")}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {!isMobile && (
            <div className="hidden md:flex items-center gap-2">
              <Button
                onClick={onAddUsers}
                variant="secondary"
                className={`flex items-center gap-2 !w-auto px-3 py-1.5 ${
                  isRTL ? 'flex-row-reverse' : ''
                }`}
                size="sm"
              >
                <UserPlus size={16} />
                <span>{t("manageUsers")}</span>
              </Button>

              <Button
                onClick={onManageTasks}
                className={`flex items-center gap-2 !w-auto px-3 py-1.5 ${
                  isRTL ? 'flex-row-reverse' : ''
                }`}
                size="sm"
              >
                <ListTodo size={16} />
                <span>{t("manageTasks")}</span>
              </Button>

              <Button
                onClick={onEditProject}
                variant="secondary"
                className={`flex items-center gap-2 !w-auto px-3 py-1.5 ${
                  isRTL ? 'flex-row-reverse' : ''
                }`}
                size="sm"
              >
                <Edit size={16} />
                <span>{t("editProject")}</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}