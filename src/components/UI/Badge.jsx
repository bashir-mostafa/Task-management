// src/components/UI/Badge.jsx
import React from "react";

const Badge = ({ 
  children, 
  color = "gray", 
  variant = "solid",
  className = "",
  ...props 
}) => {
  const colors = {
    gray: {
      solid: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      outline: "border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
    },
    red: {
      solid: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      outline: "border border-red-300 text-red-700 dark:border-red-600 dark:text-red-300"
    },
    yellow: {
      solid: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      outline: "border border-yellow-300 text-yellow-700 dark:border-yellow-600 dark:text-yellow-300"
    },
    green: {
      solid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      outline: "border border-green-300 text-green-700 dark:border-green-600 dark:text-green-300"
    },
    blue: {
      solid: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      outline: "border border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-300"
    },
    indigo: {
      solid: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
      outline: "border border-indigo-300 text-indigo-700 dark:border-indigo-600 dark:text-indigo-300"
    },
    purple: {
      solid: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      outline: "border border-purple-300 text-purple-700 dark:border-purple-600 dark:text-purple-300"
    },
    pink: {
      solid: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
      outline: "border border-pink-300 text-pink-700 dark:border-pink-600 dark:text-pink-300"
    }
  };

  const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium";
  
  return (
    <span
      className={`${baseClasses} ${colors[color][variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;