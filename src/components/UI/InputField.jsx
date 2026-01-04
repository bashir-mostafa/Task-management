import React from "react";

export default function InputField({
  label,
  value,
  onChange,
  placeholder,
  Icon,
  error,
  type = "text",
  className = "",
  isRTL = false,
  disabled = false,
  required = false,
}) {
  return (
    <div className={`space-y-3 ${className}`} dir={isRTL ? "rtl" : "ltr"}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            size={20}
            className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors duration-200
              ${isRTL ? 'right-3' : 'left-3'}`}
          />
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full py-3.5 border-2 rounded-xl 
            focus:ring-4 focus:outline-none transition-all duration-200
            ${Icon ? (isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4') : 'px-4'}
            ${error
              ? "border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30 bg-red-50/50 dark:bg-red-900/10"
              : "border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary/20 dark:focus:ring-primary/30 bg-white dark:bg-gray-800"
            }
            ${disabled ? "opacity-60 cursor-not-allowed" : ""}
            text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
          `}
        />
      </div>

      {error && (
        <p className={`text-red-600 dark:text-red-400 text-sm font-medium mt-1
          ${isRTL ? 'text-right' : 'text-left'}`}>
          {error}
        </p>
      )}
    </div>
  );
}