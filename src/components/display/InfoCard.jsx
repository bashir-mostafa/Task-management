import React from "react";
import { useTranslation } from "react-i18next";

export default function InfoCard({ 
  icon: Icon, 
  title, 
  value, 
  subValue, 
  color = "blue",
  className = "",
  isRTL = false 
}) {
  const { t } = useTranslation();
  
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    orange: "bg-orange-500",
    purple: "bg-purple-500"
  };
  
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${className}`}
    >
      <div
        className={`w-10 h-10 ${colorClasses[color]} rounded-lg flex items-center justify-center flex-shrink-0`}
      >
        <Icon size={20} className="text-white" />
      </div>
      <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t(title)}
        </p>
        <p className="font-medium text-gray-800 dark:text-white">
          {value}
        </p>
        {subValue && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
}