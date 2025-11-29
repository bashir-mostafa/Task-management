// src/pages/login/components/ErrorMessage.jsx
import React from "react";

export default function ErrorMessage({ error }) {
  return (
    <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 mb-6 rounded-xl shadow-lg text-center font-semibold animate-pulse border border-red-200 dark:border-red-800 backdrop-blur-sm">
      <div className="flex items-center justify-center gap-2">
        <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
        {error}
      </div>
    </div>
  );
}