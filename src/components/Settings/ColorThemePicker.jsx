// src/components/Settings/ColorThemePicker.jsx
import React, { useState } from 'react';
import { Settings, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useDarkMode from '../../hooks/useDarkMode';

export default function ColorThemePicker({ className = "", dir }) {
  const { t, i18n } = useTranslation();
  const { colorTheme, changeColorTheme, isReady } = useDarkMode();
  const [showColorPicker, setShowColorPicker] = useState(false);

  const colorThemes = [
    { name: 'blue', color: 'bg-blue-500', label: t('blueTheme') },
    { name: 'green', color: 'bg-green-500', label: t('greenTheme') },
    { name: 'purple', color: 'bg-purple-500', label: t('purpleTheme') },
    { name: 'orange', color: 'bg-orange-500', label: t('orangeTheme') },
    { name: 'pink', color: 'bg-pink-500', label: t('pinkTheme') },
  ];

  const isRTL = dir === "rtl" || i18n.language === "ar";

  // إذا لم يكن المود جاهزاً، لا تعرض شيئاً
  if (!isReady) return null;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowColorPicker(!showColorPicker)}
        className="p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group"
        title={t('colorTheme')}
      >
        <Settings
          size={22}
          className="text-gray-600 dark:text-gray-300 group-hover:text-primary transition-colors"
        />
      </button>

      {showColorPicker && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowColorPicker(false)}
          />
          
          <div
            className={`absolute bottom-14 ${isRTL ? "left-0" : "right-0"} bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-3 min-w-[150px] z-50`}
          >
            <div className="space-y-2">
              {colorThemes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => {
                    changeColorTheme(theme.name);
                    setShowColorPicker(false);
                  }}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full ${theme.color} border-2 ${
                      colorTheme === theme.name 
                        ? 'border-primary-500 dark:border-primary-400' 
                        : 'border-gray-300 dark:border-gray-600'
                    } flex items-center justify-center`}
                  >
                    {colorTheme === theme.name && (
                      <Check size={14} className="text-white" />
                    )}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {theme.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}