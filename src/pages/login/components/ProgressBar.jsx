// src/pages/login/components/ProgressBar.jsx
import React from "react";
import { BarChart3 } from "lucide-react";

export default function ProgressBar({ t }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          {t("projectProgress") || "Project Progress"}
        </span>
        <span className="text-sm font-bold text-primary">75%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-1000 ease-out"
          style={{ width: '75%' }}
        >
          <div className="w-full h-full bg-gradient-to-r from-transparent to-white/20 animate-pulse"></div>
        </div>
      </div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
        <span>{t("sprintGoals") || "Sprint Goals"}</span>
        <span>6/8 {t("completed") || "Completed"}</span>
      </div>
    </div>
  );
}