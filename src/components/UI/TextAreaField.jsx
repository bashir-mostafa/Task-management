// src/components/UI/TextAreaField.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle } from "lucide-react";

export default function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  error,
  dir = "ltr",
  rows = 4,
  required = false,
  disabled = false,
  className = "",
  icon,
  ...props
}) {
  const { t } = useTranslation();

  return (
    <div className={`w-full ${className}`} >
      {label && (
        <label className="block text-sm font-medium text-text mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div
            className={`absolute inset-y-0  flex items-center pointer-events-none text-text/60`}>
            {icon}
          </div>
        )}

        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border-2 rounded-xl transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
            resize-none backdrop-blur-sm
          
            ${
              error
                ? "border-red-500 bg-red-50/50 dark:bg-red-900/20 text-red-900 dark:text-red-200 placeholder-red-400"
                : "border-border bg-white/50 dark:bg-gray-700/50 text-text placeholder-text/40"
            }
            ${
              disabled
                ? "bg-text/5 text-text/40 cursor-not-allowed"
                : "hover:border-text/30 dark:hover:border-text/20"
            }
            
          `}
          {...props}
        />

        {error && (
          <div
            className={`absolute inset-y-0 ${
              dir === "rtl" ? "left-3" : "right-3"
            } flex items-center pointer-events-none`}>
            <AlertCircle size={16} className="text-red-500" />
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
    </div>
  );
}
