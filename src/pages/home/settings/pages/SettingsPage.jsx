// src/pages/SettingsPage.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import DarkModeToggle from "../../../../components/Settings/DarkModeToggle";
import ColorThemePicker from "../../../../components/Settings/ColorThemePicker";
import LanguageSwitcher from "../../../../components/Settings/LanguageSwitcher";

export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen mt-9 p-6 bg-gray-50 dark:bg-gray-900 transition-colors">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        {t("settings")}
      </h1>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            {t("darkMode")}
          </h2>
          <div className="flex justify-center">
            <DarkModeToggle />
          </div>
        </div>


        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            {t("language")}
          </h2>
          <div className="flex justify-center">
            <LanguageSwitcher />
          </div>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            {t("colorTheme")}
          </h2>
          <div className="flex justify-center">
            <ColorThemePicker />
          </div>
        </div>
      </section>
    </div>
  );
}