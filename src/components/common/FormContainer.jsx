import React from "react";

export default function FormContainer({ children, maxWidth = "3xl" }) {
  return (
    <div className={`max-w-${maxWidth} mx-auto`}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-600/50 shadow-sm">
        {children}
      </div>
    </div>
  );
}