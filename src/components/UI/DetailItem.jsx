// src/components/UI/DetailItem.jsx
import React from "react";

export default function DetailItem({
  icon: Icon,
  title,
  value,
  subValue,
  color = "blue",
  isRTL = false,
  className = "",
}) {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    orange: "bg-orange-500",
    purple: "bg-purple-500",
    red: "bg-red-500",
    gray: "bg-gray-500",
  };

  return (
    <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""} ${className}`}>
      {Icon && (
        <div className={`w-10 h-10 ${colorClasses[color]} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon size={20} className="text-white" />
        </div>
      )}
      <div className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="font-medium text-gray-800 dark:text-white">{value}</p>
        {subValue && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
}