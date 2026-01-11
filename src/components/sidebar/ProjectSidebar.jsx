import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FolderOpen,
  ListTodo,
  Users,
  Settings,
  PlusCircle,
  UserPlus,
} from "lucide-react";

export default function ProjectSidebar({
  isOpen = true,
  onToggle,
  projectId,
  isAlwaysOpen = false,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  // عناصر التنقل
  const navItems = [
    {
      id: "overview",
      name: t("projectOverview"),
      icon: FolderOpen,
      path: `/projects/${projectId}`,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      id: "tasks",
      name: t("tasks"),
      icon: ListTodo,
      path: `/projects/${projectId}/tasks`,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      id: "users",
      name: t("users"),
      icon: Users,
      path: `/projects/${projectId}/users`,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      id: "settings",
      name: t("settings"),
      icon: Settings,
      path: `/projects/${projectId}/edit`,
      color: "text-gray-600 dark:text-gray-400",
      bgColor: "bg-gray-50 dark:bg-gray-900/20",
    }
  ];

  // الإجراءات السريعة
  const quickActions = [
    {
      name: t("addTask"),
      icon: PlusCircle,
      path: `/projects/${projectId}/tasks/create`,
    },
    {
      name: t("addUser"),
      icon: UserPlus,
      path: `/projects/${projectId}/users`,
    },
  ];

  return (
    <aside
      className={`h-[91vh] top-16 absolute bg-white dark:bg-gray-800 border-l ${
        isRTL ? "border-r" : "border-l"
      } border-gray-200 dark:border-gray-700 flex flex-col w-64`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <FolderOpen size={18} className="text-white" />
          </div>
          <div className="grid grid-cols-2 gap-14">
            <div>

              {t("project")} 
            </div>
            
            <div className="flex items-center gap-1 mt-1">
            ID :  {projectId} 
            </div>
          </div>
        </div>

        {!isAlwaysOpen && window.innerWidth < 1024 && (
          <div className="mt-3 text-center">
            <button
              onClick={onToggle}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              {isOpen ? t("hideSidebar") : t("showSidebar")}
            </button>
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              window.location.pathname === item.path 
              

            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={`flex items-center p-3 rounded-lg transition-all ${
                  isActive
                    ? `${item.bgColor} ${item.color} border border-current/20`
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}>
                <item.icon size={20} />
                <span className="ml-3 flex-1 text-left">{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="mt-6">
          <h4 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold mb-3">
            {t("quickActions")}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <NavLink
                key={index}
                to={action.path}
                className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <action.icon
                  size={18}
                  className="text-blue-600 dark:text-blue-400"
                />
                <span className="text-xs mt-1 text-gray-700 dark:text-gray-300 text-center">
                  {action.name}
                </span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}
