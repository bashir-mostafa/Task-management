import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import DarkModeToggle from "../Settings/DarkModeToggle";
import LanguageSwitcher from "../Settings/LanguageSwitcher";
import { useAuth } from "../../contexts/AuthContext";
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  Home,
  LogOut,
  ChevronDown,
  Youtube,
  Mic,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../Settings/LogoutButton";

export default function Navbar({ toggleSidebar, isSidebarOpen, isRTL }) {
  const { t } = useTranslation();
  const { state } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // Implement search logic here
    }
  };

  const userMenuItems = [
    {
      label: t("settings"),
      icon: <Settings size={16} />,
      onClick: () => navigate("/settings"),
    },
  ];

  return (
    <nav className="w-full h-14 sm:h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-50">
      <div className={`flex items-center gap-4`}>
        <button
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? t("closeSidebar") : t("openSidebar")}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <Menu size={24} className="text-gray-700 dark:text-gray-300" />
        </button>

        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer">
          <span className="text-xl font-bold text-gray-900 dark:text-white hidden md:inline">
            {t("appName")}
          </span>
        </div>
      </div>

      <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {state.user?.username?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
            <ChevronDown
              size={16}
              className="text-gray-700 dark:text-gray-300"
            />
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div
                className={`absolute top-full mt-2 ${
                  isRTL ? "left-0" : "right-0"
                } w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50`}>
                {/* User Info */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {state.user?.username?.[0]?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {state.user?.username || t("user")}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {state.user?.email || "user@example.com"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  {userMenuItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        item.onClick();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>

                {/* Settings & Dark Mode */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      {t("darkMode")}
                    </span>
                    <DarkModeToggle />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      {t("language")}
                    </span>
                    <LanguageSwitcher />
                  </div>
                  
                  {/* زر تسجيل الخروج المنفصل */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <LogoutButton
                      variant="ghost"
                      showLabel={true}
                      className="w-full justify-center"
                      icon={<LogOut size={18} />}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}