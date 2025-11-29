// src/components/Settings/LanguageSwitcher.jsx
// (لم تغير، لكنه جيد مع تعديل بسيط للـ bottom إذا لزم)
import React, { useState, useRef, useEffect } from "react";
import { Languages, ChevronDown, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher({ className = "" }) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const languages = [
    { code: "ar", name: "العربية", flag: "🇸🇦", dir: "rtl" },
    { code: "en", name: "English", flag: "🇺🇸", dir: "ltr" },
    { code: "ku", name: "Kurmanji", flag: "☀️", dir: "ltr" },
  ];

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  const changeLanguage = (languageCode) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 flex items-center gap-2 group w-full min-w-[120px] justify-between"
        title={t("switchLanguage")}>
        <div className="flex items-center gap-2">
          <Languages
            size={16}
            className="text-gray-600 dark:text-gray-300 group-hover:text-primary transition-colors"
          />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
            {currentLanguage.name}
          </span>
        </div>
        <ChevronDown
          size={15}
          className={`text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-14 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-40">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={`w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                currentLanguage.code === language.code
                  ? "bg-primary/10 dark:bg-primary/20"
                  : ""
              }`}>
              <span className="text-lg">{language.flag}</span>

              <span className="flex-1 text-sm text-right text-gray-700 dark:text-gray-300">
                {language.name}
              </span>

              {currentLanguage.code === language.code && (
                <Check size={15} className="text-primary flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
