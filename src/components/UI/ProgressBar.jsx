// src/components/UI/ProgressBar.jsx
import React from "react";

export default function ProgressBar({
  value,
  max = 100,
  label,
  subLabel,
  showPercentage = true,
  color = "primary",
  height = "h-3",
  animated = false,
  className = "",
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const colorClasses = {
    primary: "bg-gradient-to-r from-primary to-secondary",
    blue: "bg-gradient-to-r from-blue-500 to-cyan-500",
    green: "bg-gradient-to-r from-green-500 to-emerald-500",
    yellow: "bg-gradient-to-r from-yellow-500 to-amber-500",
    red: "bg-gradient-to-r from-red-500 to-pink-500",
    purple: "bg-gradient-to-r from-purple-500 to-pink-500",
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {(label || subLabel || showPercentage) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>}
          <div className="flex items-center gap-2">
            {showPercentage && (
              <span className="text-sm font-bold text-gray-800 dark:text-white">
                {Math.round(percentage)}%
              </span>
            )}
            {subLabel && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {subLabel}
              </span>
            )}
          </div>
        </div>
      )}
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${height} overflow-hidden`}>
        <div
          className={`${colorClasses[color]} h-full rounded-full transition-all duration-1000 ease-out relative ${
            animated ? "animate-pulse" : ""
          }`}
          style={{ width: `${percentage}%` }}
        >
          {animated && (
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"
              aria-hidden="true"
            />
          )}
        </div>
      </div>
    </div>
  );
}