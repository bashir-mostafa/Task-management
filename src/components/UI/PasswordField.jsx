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
  dir = "ltr",
}) {
  const isRTL = dir === "rtl";

  return (
    <div className="space-y-2">
      <label className={`block text-sm font-medium text-text ${isRTL ? "text-right" : "text-left"}`}>
        {label}
      </label>

      <div className="relative">
        <Lock
          size={20}
          className={`absolute top-1/2 -translate-y-1/2 text-neutral ${
            isRTL ? "right-3" : "left-3"
          }`}
        />

        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          dir={dir}
          className={`w-full py-3 border rounded-xl focus:ring-2 focus:outline-none transition-all 
            ${isRTL ? "pr-10 pl-10" : "pl-10 pr-10"} 
            ${
              error
                ? "border-red-500 focus:ring-red-200 dark:focus:ring-red-800"
                : "border-border focus:ring-primary/20 dark:focus:ring-primary/40"
            } 
            bg-background text-text placeholder-neutral`}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={`absolute top-1/2 -translate-y-1/2 text-neutral hover:text-primary transition-colors 
            ${isRTL ? "left-3" : "right-3"}`}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {error && (
        <p className={`text-red-500 text-sm ${isRTL ? "text-right" : "text-left"}`}>{error}</p>
      )}
    </div>
  );
}