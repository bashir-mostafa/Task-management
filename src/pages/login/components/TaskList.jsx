// src/pages/login/components/TaskList.jsx
import React from "react";
import { CheckCircle, Users, BarChart3, Calendar } from "lucide-react";
import TaskItem from "./TaskItem";

export default function TaskList({ t }) {
  return (
    <div className="space-y-3 mb-6">
      <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-3 flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        {t("todayTasks") || "Today's Tasks"}
      </h3>
      
      <TaskItem
        icon={CheckCircle}
        iconBg="bg-blue-500"
        title={t("designReview") || "Design Review"}
        time="10:00 AM - 11:30 AM"
        statusColor="bg-green-500 animate-pulse"
        gradientFrom="from-blue-50/25 to-blue-100/50"
        gradientDarkFrom="from-blue-900/20 to-blue-800/10"
        borderColor="border-blue-200/50"
        borderDarkColor="border-blue-700/30"
      />

      <TaskItem
        icon={Users}
        iconBg="bg-purple-500"
        title={t("teamMeeting") || "Team Meeting"}
        time="02:00 PM - 03:00 PM"
        statusColor="bg-yellow-500"
        gradientFrom="from-purple-50/25 to-purple-100/50"
        gradientDarkFrom="from-purple-900/20 to-purple-800/10"
        borderColor="border-purple-200/50"
        borderDarkColor="border-purple-700/30"
      />

      <TaskItem
        icon={BarChart3}
        iconBg="bg-green-500"
        title={t("progressReport") || "Progress Report"}
        time="04:30 PM - 05:00 PM"
        statusColor="bg-blue-500"
        gradientFrom="from-green-50/25 to-green-100/50"
        gradientDarkFrom="from-green-900/20 to-green-800/10"
        borderColor="border-green-200/50"
        borderDarkColor="border-green-700/30"
      />
    </div>
  );
}