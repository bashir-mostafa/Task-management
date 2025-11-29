// src/pages/login/components/TaskItem.jsx
import React from "react";
import { Clock } from "lucide-react";

export default function TaskItem({
  icon: Icon,
  iconBg,
  title,
  time,
  statusColor,
  gradientFrom,
  gradientDarkFrom,
  borderColor,
  borderDarkColor,
}) {
  return (
    <div className={`flex items-center gap-3 p-3 bg-gradient-to-r ${gradientFrom} dark:${gradientDarkFrom} rounded-xl border ${borderColor} dark:${borderDarkColor} hover:shadow-md transition-all duration-300`}>
      <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {title}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {time}
        </div>
      </div>
      <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
    </div>
  );
}