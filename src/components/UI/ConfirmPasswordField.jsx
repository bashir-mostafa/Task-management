// src/components/UI/ConfirmPasswordField.jsx
import React from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function ConfirmPasswordField({
  label,
  value,
  onChange,
  showPassword,
  onToggleShowPassword,
  placeholder,
  isRTL,
  error,
  passwordsMatch,
}) {
  return (
    <div className="w-full">
      <label
        className={`block text-sm font-medium mb-1 ${
          isRTL ? "text-right" : "text-left"
        }`}
      >
        {label}
      </label>

      <div className="relative">
        <Lock
          className={`absolute top-1/2 -translate-y-1/2 text-neutral ${
            isRTL ? "right-3" : "left-3"
          }`}
          size={20}
        />

        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          dir={isRTL ? "rtl" : "ltr"}
          className={`w-full py-3 border rounded-xl bg-background text-text placeholder-neutral
            focus:ring-2 focus:ring-primary/30 transition
            ${isRTL ? "pr-10 pl-12" : "pl-10 pr-12"}
            ${
              error ? "border-red-500 focus:ring-red-300" : "border-border"
            }`}
        />

        <button
          type="button"
          onClick={onToggleShowPassword}
          className={`absolute top-1/2 -translate-y-1/2 text-neutral hover:text-primary
            ${isRTL ? "left-3" : "right-3"}`}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {/* تطابق كلمة المرور */}
      {value?.length > 0 && !error && (
        <p
          className={`text-xs mt-1 ${
            passwordsMatch ? "text-green-500" : "text-red-500"
          } ${isRTL ? "text-right" : "text-left"}`}
        >
          {passwordsMatch ? "✓ كلمات المرور متطابقة" : "✗ كلمات المرور غير متطابقة"}
        </p>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
