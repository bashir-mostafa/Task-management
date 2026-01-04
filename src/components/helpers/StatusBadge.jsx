import React from "react";
import {
  CheckCircle,
  Clock,
  BarChart3,
  PauseCircle,
  XCircle
} from "lucide-react";

const statusConfig = {
  planning: {
    icon: Clock,
    text: "planning",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-800 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800"
  },
  Underimplementation: {
    icon: BarChart3,
    text: "Underimplementation",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    textColor: "text-yellow-800 dark:text-yellow-300",
    border: "border-yellow-200 dark:border-yellow-800"
  },
  Complete: {
    icon: CheckCircle,
    text: "Complete",
    bg: "bg-green-100 dark:bg-green-900/30",
    textColor: "text-green-800 dark:text-green-300",
    border: "border-green-200 dark:border-green-800"
  },
  Pause: {
    icon: PauseCircle,
    text: "Pause",
    bg: "bg-orange-100 dark:bg-orange-900/30",
    textColor: "text-orange-800 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-800"
  },
  Notimplemented: {
    icon: XCircle,
    text: "Notimplemented",
    bg: "bg-red-100 dark:bg-red-900/30",
    textColor: "text-red-800 dark:text-red-300",
    border: "border-red-200 dark:border-red-800"
  }
};

export default function StatusBadge({ status, size = "default", showIcon = true }) {
  const config = statusConfig[status] || statusConfig.planning;
  const Icon = config.icon;
  
  const sizeClasses = {
    small: "px-2 py-0.5 text-xs",
    default: "px-2.5 py-1 text-sm",
    large: "px-3 py-1.5 text-base"
  };
  
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${config.bg} ${config.textColor} ${config.border} border
        ${sizeClasses[size]}
      `}
    >
      {showIcon && <Icon size={size === "small" ? 12 : 14} />}
      <span>{config.text}</span>
    </span>
  );
}