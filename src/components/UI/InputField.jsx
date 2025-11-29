// src/components/UI/InputField.jsx
// (No changes, as provided)
import React from "react";

export default function InputField({
  label,
  value,
  onChange,
  placeholder,
  Icon,
  error,
  type = "text",
  dir = "ltr",
}) {
  const isRTL = dir === "rtl";

  return (
    <div className="space-y-2">
      <label className={`block text-sm font-medium text-text ${isRTL ? "text-right" : "text-left"}`}>
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={20}
            className={`absolute top-1/2 -translate-y-1/2 text-neutral ${
              isRTL ? "right-3" : "left-3"
            }`}
          />
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          dir={dir}
          className={`w-full py-3 border rounded-xl focus:ring-2 focus:outline-none transition-all
            ${Icon ? (isRTL ? "pr-10 pl-4" : "pl-10 pr-4") : "px-4"} 
            ${
              error
                ? "border-red-500 focus:ring-red-200 dark:focus:ring-red-800"
                : "border-border focus:ring-primary/20 dark:focus:ring-primary/40"
            } 
            bg-background text-text placeholder-neutral`}
        />
      </div>

      {error && (
        <p className={`text-red-500 text-sm ${isRTL ? "text-right" : "text-left"}`}>{error}</p>
      )}
    </div>
  );
}