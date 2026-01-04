// src/components/UI/Dropdown.jsx
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function CustomDropdown({
  options,
  value,
  onChange,
  placeholder,
  isRTL = false,
  className = "",
  size = "small"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // أحجام مختلفة
  const sizeClasses = {
    small: "py-1.5 px-3 text-sm",
    medium: "py-2 px-3 text-base",
    large: "py-3 px-4 text-lg"
  };

  const iconSizes = {
    small: 16,
    medium: 18,
    large: 20
  };

  return (
    <div 
      className={`relative ${className}`} 
      ref={dropdownRef}
      
    >
      {/* الزر الرئيسي */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 ${
          sizeClasses[size]
        } ${isOpen ? "border-[rgb(var(--color-primary))] ring-2 ring-[rgba(var(--color-primary),0.2)]" : ""}`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          size={iconSizes[size]} 
          className={`text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* قائمة الخيارات */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                option.value === value
                  ? "bg-[rgb(var(--color-primary))] text-white"
                  : "text-gray-900 dark:text-white"
              } ${isRTL ? "text-right" : "text-left"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}