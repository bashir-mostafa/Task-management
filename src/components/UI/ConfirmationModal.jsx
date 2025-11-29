import React from "react";
import { X } from "lucide-react";

export default function ConfirmationModal({
  title,
  message,
  icon,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isRTL = false,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-xl shadow-2xl max-w-md w-full animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              {icon}
            </div>
            <h3 className="text-lg font-semibold text-text">{title}</h3>
          </div>

          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Message */}
        <div className="p-6">
          <p className="text-text text-center">{message}</p>
        </div>

        {/* Actions */}
        <div className={`flex gap-3 p-6 border-t border-border ${isRTL ? "flex-row-reverse" : ""}`}>
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-border text-text hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
