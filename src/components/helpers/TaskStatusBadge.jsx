import React from "react";
import { useTranslation } from "react-i18next";
import {
  Clock,
  BarChart3,
  CheckCircle,
  PauseCircle,
  XCircle
} from "lucide-react";

const statusConfig = {
  0: {
    icon: Clock,
    bg: "bg-gray-100 dark:bg-gray-800",
    textColor: "text-gray-800 dark:text-gray-300"
  },
  1: {
    icon: BarChart3,
    bg: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-800 dark:text-blue-300"
  },
  2: {
    icon: CheckCircle,
    bg: "bg-green-100 dark:bg-green-900/30",
    textColor: "text-green-800 dark:text-green-300"
  },
  3: {
    icon: PauseCircle,
    bg: "bg-orange-100 dark:bg-orange-900/30",
    textColor: "text-orange-800 dark:text-orange-300"
  },
  4: {
    icon: XCircle,
    bg: "bg-red-100 dark:bg-red-900/30",
    textColor: "text-red-800 dark:text-red-300"
  }
};

export default function TaskStatusBadge({ status, size = "default", showIcon = true }) {
  const { t } = useTranslation();
  const config = statusConfig[status] || statusConfig[0];
  const Icon = config.icon;
  
  const sizeClasses = {
    small: "px-2 py-0.5 text-xs",
    default: "px-2 py-1 text-sm",
    large: "px-3 py-1.5 text-base"
  };
  
  const statusText = {
    0: t("pending"),
    1: t("inProgress"),
    2: t("completed"),
    3: t("paused"),
    4: t("notImplemented")
  };
  
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${config.bg} ${config.textColor}
        ${sizeClasses[size]}
      `}
    >
      {showIcon && <Icon size={size === "small" ? 12 : 14} />}
      <span>{statusText[status]}</span>
    </span>
  );
}