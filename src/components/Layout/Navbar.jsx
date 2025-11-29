import React from "react";
import { useTranslation } from "react-i18next";
import DarkModeToggle from "../Settings/DarkModeToggle";
import LanguageSwitcher from "../Settings/LanguageSwitcher";
import { useAuth } from "../../contexts/AuthContext";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";

export default function Navbar({ toggleSidebar, isSidebarOpen, isRTL }) {
  const { t } = useTranslation();
  const { state } = useAuth();

  return (
    <nav className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-navbar text-navbar flex justify-between items-center transition-colors duration-200 border-b border-border shadow-sm relative z-30">
      <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
        <div className="text-gray-800 dark:text-gray-200 text-base sm:text-lg font-medium">
          {t("welcome")}, {state.user?.username || t("user")}
        </div>
      <button
        onClick={toggleSidebar}
        aria-label={isSidebarOpen ? t("closeSidebar") : t("openSidebar")}
        aria-expanded={isSidebarOpen}
        className="text-text hover:text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-primary/50 rounded p-1"
      >
          {isSidebarOpen ? (isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />) : <Menu size={20} />}
        </button>
      </div>
      <div className="flex gap-2 sm:gap-3 items-center">
        <DarkModeToggle />
        <LanguageSwitcher />
      </div>
    </nav>
  );
}