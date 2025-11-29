// src/pages/login/components/StatsGrid.jsx
import React from "react";

export default function StatsGrid({ t }) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          12
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-300">
          {t("tasks") || "Tasks"}
        </div>
      </div>
      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
          8
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-300">
          {t("completed") || "Completed"}
        </div>
      </div>
      <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
          2
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-300">
          {t("teams") || "Teams"}
        </div>
      </div>
    </div>
  );
}
