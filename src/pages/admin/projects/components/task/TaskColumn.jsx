// src/components/Projects/TaskColumn.jsx
import React from "react";

const TaskColumn = React.memo(({
  title,
  icon: Icon,
  color,
  taskCount,
  status,
  children,
  onDragOver,
  onDragLeave,
  onDrop,
  isRTL = false
}) => {
  const colorClasses = {
    gray: "bg-gray-500 text-gray-100",
    yellow: "bg-yellow-500 text-yellow-100", 
    green: "bg-green-500 text-green-100",
    blue: "bg-blue-500 text-blue-100"
  };

  const borderColors = {
    gray: "border-gray-200 dark:border-gray-600",
    yellow: "border-yellow-200 dark:border-yellow-600",
    green: "border-green-200 dark:border-green-600",
    blue: "border-blue-200 dark:border-blue-600"
  };

  return (
    <div
      className={`flex flex-col h-full min-h-[600px] bg-gradient-to-b from-white/50 to-gray-50/30 dark:from-gray-800/50 dark:to-gray-700/30 rounded-2xl border-2 ${borderColors[color]} transition-all duration-300 backdrop-blur-sm`}
      onDragOver={(e) => onDragOver(e, status)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, status)}
      data-status={status}
      aria-label={`${title} column with ${taskCount} tasks`}
    >
      {/* Column Header */}
      <div className={`flex items-center justify-between p-4 border-b ${borderColors[color]} bg-white/80 dark:bg-gray-800/80 rounded-t-2xl backdrop-blur-sm ${isRTL ? "flex-row-reverse" : ""}`}>
        <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
            <Icon size={20} aria-hidden="true" />
          </div>
          <div className={isRTL ? "text-right" : "text-left"}>
            <h3 className="font-semibold text-gray-800 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{taskCount} tasks</p>
          </div>
        </div>
        
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${colorClasses[color]}`}>
          {taskCount}
        </div>
      </div>

      {/* Tasks Container */}
      <div 
        className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar"
        aria-live="polite"
        aria-atomic="true"
      >
        {children}
        
        {/* Empty State */}
        {taskCount === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
              <Icon size={24} className="text-gray-400" aria-hidden="true" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No tasks in {title.toLowerCase()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

TaskColumn.displayName = 'TaskColumn';

export default TaskColumn;