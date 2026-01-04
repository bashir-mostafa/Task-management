import React from "react";
import { useTranslation } from "react-i18next";

export default function StatCard({ 
  title, 
  value, 
  subValue, 
  color = "blue", 
  icon: Icon, 
  onClick,
  className = "" 
}) {
  const { t } = useTranslation();
  
  const colorClasses = {
    blue: {
      bg: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
      border: "border-blue-200/50 dark:border-blue-700/30",
      text: "text-blue-600 dark:text-blue-400",
      subText: "text-blue-500 dark:text-blue-300"
    },
    green: {
      bg: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20",
      border: "border-green-200/50 dark:border-green-700/30",
      text: "text-green-600 dark:text-green-400",
      subText: "text-green-500 dark:text-green-300"
    },
    yellow: {
      bg: "from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20",
      border: "border-yellow-200/50 dark:border-yellow-700/30",
      text: "text-yellow-600 dark:text-yellow-400",
      subText: "text-yellow-500 dark:text-yellow-300"
    },
    purple: {
      bg: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
      border: "border-purple-200/50 dark:border-purple-700/30",
      text: "text-purple-600 dark:text-purple-400",
      subText: "text-purple-500 dark:text-purple-300"
    }
  };
  
  const classes = colorClasses[color] || colorClasses.blue;
  
  return (
    <div
      onClick={onClick}
      className={`
        text-center p-4 rounded-xl border cursor-pointer 
        hover:shadow-lg transition-all hover:scale-[1.02]
        bg-gradient-to-br ${classes.bg} ${classes.border}
        ${className}
      `}
    >
      {Icon && (
        <div className="flex justify-center mb-2">
          <Icon size={24} className={classes.text} />
        </div>
      )}
      <div className={`text-2xl md:text-3xl font-bold ${classes.text}`}>
        {value}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
        {t(title)}
      </div>
      {subValue && (
        <div className={`text-xs ${classes.subText} mt-2`}>
          {subValue}
        </div>
      )}
    </div>
  );
}