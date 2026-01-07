// src/components/UI/ConfirmPasswordField.jsx
import React from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function ConfirmPasswordField({
  label = "تأكيد كلمة المرور",
  value,
  onChange,
  placeholder,
  error,
  isRTL = false,
  showPassword,
  onToggleShowPassword,
  passwordsMatch,
  required = false,
}) {
  return (
    <div className="space-y-3">
      <label className={`block text-sm font-semibold text-gray-700 dark:text-gray-300 ${isRTL ? "text-right" : "text-left"} mb-1`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <Lock
          size={20}
          className={`absolute top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 ${
            isRTL ? "right-4" : "left-4"
          } transition-colors duration-200`}
        />

        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full py-3.5 px-4 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all duration-200
            ${isRTL ? "pr-12 pl-12" : "pl-12 pr-12"} 
            ${
              error
                ? "border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30 bg-red-50/50 dark:bg-red-900/10"
                : "border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary/20 dark:focus:ring-primary/30 bg-white dark:bg-gray-800"
            } 
            text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
        />

        <button
          type="button"
          onClick={onToggleShowPassword}
          className={`absolute top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors duration-200 ${
            isRTL ? "left-4" : "right-4"
          }`}
          aria-label={showPassword ? "إخفاء كلمة المرور" : "عرض كلمة المرور"}
        >
          {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
        </button>
      </div>

      {/* رسالة تطابق كلمة المرور */}
      {value && value.length > 0 && !error && (
        <p
          className={`text-sm font-medium mt-1 ${
            passwordsMatch
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          } ${isRTL ? "text-right" : "text-left"}`}
        >
          {passwordsMatch 
            ? "✓ كلمات المرور متطابقة" 
            : "✗ كلمات المرور غير متطابقة"}
        </p>
      )}

      {error && (
        <p className={`text-red-600 dark:text-red-400 text-sm font-medium ${isRTL ? "text-right" : "text-left"} mt-1`}>
          {error}
        </p>
      )}
    </div>
  );
}