// src/components/Settings/DarkModeToggle.jsx
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
      className={`p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group ${className}`}
      title={isDark ? t('lightMode') : t('darkMode')}
      aria-label={isDark ? t('lightMode') : t('darkMode')}
    >
      {isDark ? (
        <Sun size={20} className="text-yellow-500 group-hover:text-yellow-400 transition-colors" />
      ) : (
        <Moon size={20} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
      )}
    </button>
  );
}