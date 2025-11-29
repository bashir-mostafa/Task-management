// src/components/Settings/DarkModeToggle.jsx
// (لم تغير، لكنه جيد)
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useDarkMode from '../../hooks/useDarkMode';

export default function DarkModeToggle({ className = "" }) {
  const { t } = useTranslation();
  const { isDark, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className={`p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group ${className}`}
      title={isDark ? t('lightMode') : t('darkMode')}
    >
      {isDark ? (
        <Sun size={15} className="text-yellow-500 group-hover:text-yellow-400 transition-colors" />
      ) : (
        <Moon size={15} className="text-gray-600 group-hover:text-indigo-600 transition-colors" />
      )}
    </button>
  );
}