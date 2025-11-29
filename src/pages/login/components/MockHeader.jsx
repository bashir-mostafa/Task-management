// src/pages/login/components/MockHeader.jsx
import React from "react";
import { Target } from "lucide-react";

export default function MockHeader({ t }) {
  return (
    <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
          <Target className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-gray-800 dark:text-white text-lg">
            {t("appName")}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t("taskManagement") || "Task Management"}
          </p>
        </div>
      </div>
      <div className="flex gap-1">
        <div className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 cursor-pointer transition-colors"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500 cursor-pointer transition-colors"></div>
        <div className="w-3 h-3 rounded-full bg-green-400 hover:bg-green-500 cursor-pointer transition-colors"></div>
      </div>
    </div>
  );
}