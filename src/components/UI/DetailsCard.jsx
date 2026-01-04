// src/components/UI/DetailsCard.jsx
import React from "react";

export default function DetailsCard({
  children,
  title,
  icon: Icon,
  className = "",
  titleClassName = "",
  bodyClassName = "",
  actions,
}) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-600/50 shadow-sm ${className}`}>
      {(title || Icon || actions) && (
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-600/50">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <Icon size={20} className="text-white" />
              </div>
            )}
            <h2 className={`text-lg font-semibold text-gray-800 dark:text-white ${titleClassName}`}>
              {title}
            </h2>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
}