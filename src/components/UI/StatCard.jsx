// src/components/UI/StatCard.jsx
import React from "react";
import { useTranslation } from "react-i18next";

export default function StatCard({
  title,
  value,
  subValue,
  icon: Icon,
  color = "blue",
  onClick,
  className = "",
}) {
  const { t } = useTranslation();
  
  const colorClasses = {
    blue: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200/50 dark:border-blue-700/30 text-blue-600 dark:text-blue-400",
    green: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200/50 dark:border-green-700/30 text-green-600 dark:text-green-400",
    yellow: "from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200/50 dark:border-yellow-700/30 text-yellow-600 dark:text-yellow-400",
    purple: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200/50 dark:border-purple-700/30 text-purple-600 dark:text-purple-400",
    red: "from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200/50 dark:border-red-700/30 text-red-600 dark:text-red-400",
  };

  return (
    <div
      onClick={onClick}
      className={`text-center p-1 rounded-xl border cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] bg-gradient-to-br ${
        colorClasses[color]
      } ${className} ${onClick ? "cursor-pointer" : ""}`}
    >
      {Icon && (
        <div className="flex mb-2">
          <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
            <Icon size={20} className={`text-${color}-600 dark:text-${color}-400`} />
          </div>
        </div>
      )}
      <div className={`text-2xl md:text-3xl font-bold`}>
        {value}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
        {t(title)}
      </div>
      {subValue && (
        <div className={`text-xs text-${color}-500 dark:text-${color}-300 mt-2`}>
          {subValue}
        </div>
      )}
    </div>
  );
}