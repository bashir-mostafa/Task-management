// src/components/Layout/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import LogoutButton from "../Settings/LogoutButton";
import {
  LayoutDashboard,
  ListTodo,
  Users,
  Folder,
  Settings,
  Home,
  Bell,
  BarChart2,
  LogIn,
} from "lucide-react";

export default function Sidebar({ isOpen, toggleSidebar, isRTL }) {
  const { t } = useTranslation();
  const { state } = useAuth();

  const role = state.role;

  const sidebarPosition = isRTL ? "right-0" : "left-0";

  // 🧭 الروابط لكل دور - مصغرة
  const menuItems = {
    User: [
      { to: "/home", label: t("home"), icon: <Home size={20} /> },
      { to: "/home/tasks", label: t("tasks"), icon: <ListTodo size={20} /> },
      {to: "/home/projects", label: t("projects"), icon: <Folder size={20} />},
      {
        to: "/home/settings",
        label: t("settings"),
        icon: <Settings size={20} />,
      },
    ],
    Admin: [
      {
        to: "/dashboard",
        label: t("dashboard"),
        icon: <LayoutDashboard size={20} />,
      },
      {
        to: "/projects",
        label: t("projects"),
        icon: <Folder size={20} />,
      },

      { to: "/users", label: t("users"), icon: <Users size={20} /> },

      {
        to: "/settings",
        label: t("settings"),
        icon: <Settings size={20} />,
      },
    ],
  };

  const items = menuItems[role] || [];

  return (
    <aside
      className={`h-[91vh] bg-primary text-white flex  flex-col fixed ${sidebarPosition} top-16 z-40 shadow-lg overflow-hidden transition-all duration-200 ${
        isOpen ? "w-52" : "w-16"
      }`}>
    
      {/* روابط التنقل */}
      <nav className="flex-1 px-2 mt-5">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center rounded-lg transition-all duration-200 text-sm ${
                    isActive ? "bg-white/20 shadow" : "hover:bg-white/10"
                  } ${isOpen ? "px-3 py-2 gap-3" : "justify-center p-2"} ${
                    isRTL ? "flex-row-reverse" : ""
                  }`
                }
                title={isOpen ? "" : item.label}>
                <div className="relative group flex-shrink-0">
                  {item.icon}
                  {!isOpen && (
                    <div
                      className={`absolute ${
                        isRTL ? "right-full mr-2" : "left-full ml-2"
                      } top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-lg`}>
                      {item.label}
                    </div>
                  )}
                </div>
                <div
                  className={`transition-all duration-200 ${
                    isOpen
                      ? "opacity-100 w-auto"
                      : "opacity-0 w-0 overflow-hidden"
                  }`}>
                  <span className="font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* أزرار الدخول والخروج */}
      <div className="flex-shrink-0 p-3 border-t border-white/10">
        <div
          className={`flex flex-col ${
            isOpen ? "gap-3" : "gap-2 items-center"
          }`}>
          {/* زر تسجيل الدخول - يظهر عندما المستخدم مو مسجل */}
          {!state.user && (
            <NavLink
              to="/login"
              className={`flex items-center rounded-lg font-medium hover:bg-white/10 transition-all text-sm ${
                isOpen ? "w-full py-2 px-3 gap-3" : "justify-center p-2"
              } ${isRTL ? "flex-row-reverse" : ""}`}
              title={isOpen ? "" : t("login")}>
              <div className="relative group flex-shrink-0">
                <LogIn size={20} />
                {!isOpen && (
                  <div
                    className={`absolute ${
                      isRTL ? "right-full mr-2" : "left-full ml-2"
                    } top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-lg`}>
                    {t("login")}
                  </div>
                )}
              </div>
              <div
                className={`transition-all duration-200 ${
                  isOpen
                    ? "opacity-100 w-auto"
                    : "opacity-0 w-0 overflow-hidden"
                }`}>
                <span className="font-medium whitespace-nowrap">
                  {t("login")}
                </span>
              </div>
            </NavLink>
          )}

          {/* زر تسجيل الخروج - يظهر عندما المستخدم مسجل */}
          {state.user && (
            <LogoutButton
              variant="sidebar"
              className={`flex items-center justify-center rounded-lg font-medium hover:bg-white/10 transition-all text-sm ${
                isOpen ? "w-full py-2 px-3 gap-3" : "p-2"
              } ${isRTL ? "flex-row-reverse" : ""}`}
              icon={<LogIn size={20} />}
              showLabel={isOpen}
            />
          )}

          {/* حقوق النشر */}
          <div
            className={`text-white/50 text-xs text-center transition-opacity duration-200 ${
              isOpen ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
            }`}>
            {t("appName")} © 2025
          </div>
        </div>
      </div>
    </aside>
  );
}
