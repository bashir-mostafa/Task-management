import React from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export default function MessageComponent({ 
  message, 
  onClose,
  className = "" 
}) {
  if (!message) return null;

  const messageTypes = {
    success: {
      icon: <CheckCircle size={16} className="text-green-600 dark:text-green-400" />,
      styles: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
    },
    error: {
      icon: <AlertCircle size={16} className="text-red-600 dark:text-red-400" />,
      styles: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
    },
    warning: {
      icon: <AlertTriangle size={16} className="text-yellow-600 dark:text-yellow-400" />,
      styles: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300"
    },
    info: {
      icon: <Info size={16} className="text-blue-600 dark:text-blue-400" />,
      styles: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300"
    }
  };

  const currentType = messageTypes[message.type] || messageTypes.info;

  return (
    <div
      className={`p-3 rounded-lg border flex items-center justify-between animate-fade-in ${currentType.styles} ${className}`}
    >
      <div className="flex items-center gap-2">
        {currentType.icon}
        <span className="text-sm font-medium">{message.text}</span>
      </div>
      
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors flex-shrink-0"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}