// src/components/UI/PasswordField.jsx
// (No changes, as provided)
import React from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function PasswordField({
  label = "كلمة المرور",
  value,
  onChange,
  showPassword,
  setShowPassword,
  placeholder,
  error,
  isRTL = false,
}) {
  return (
    <div className="space-y-3">
      <label className={`block text-sm font-semibold text-gray-700 dark:text-gray-300 ${isRTL ? "text-right" : "text-left"} mb-1`}>
        {label}
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
          onChange={onChange}
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
          onClick={() => setShowPassword(!showPassword)}
          className={`absolute top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors duration-200 ${
            isRTL ? "left-4" : "right-4"
          }`}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
        </button>
      </div>

      {error && (
        <p className={`text-red-600 dark:text-red-400 text-sm font-medium ${isRTL ? "text-right" : "text-left"} mt-1`}>
          {error}
        </p>
      )}
    </div>
  );
}