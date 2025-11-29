// Settings Page - Compact Design
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import DarkModeToggle from "../../../../components/Settings/DarkModeToggle";
import ColorThemePicker from "../../../../components/Settings/ColorThemePicker";
import LanguageSwitcher from "../../../../components/Settings/LanguageSwitcher";
import ChangePasswordSection from "../components/ChangePasswordSection";
import { 
  Palette, 
  Globe, 
  Moon, 
  Shield, 
  User, 
  Bell,
  CreditCard,
  Database,
  Download,
  Upload,
  RefreshCw,
  Archive,
  HardDrive,
  Cloud,
  Clock,
  CheckCircle,
  Settings2
} from "lucide-react";

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const [activeTab, setActiveTab] = useState("general");

  const settingsTabs = [
    { id: "general", label: t("general"), icon: <User size={16} /> },
    { id: "appearance", label: t("appearance"), icon: <Palette size={16} /> },
    { id: "security", label: t("security"), icon: <Shield size={16} /> },
    { id: "backup", label: t("backupRestore"), icon: <Database size={16} /> },
    { id: "notifications", label: t("notifications"), icon: <Bell size={16} /> },
    { id: "billing", label: t("billing"), icon: <CreditCard size={16} /> },
  ];

  const backupHistory = [
    { id: 1, name: "Backup_2024_12_19", date: "2024-12-19", size: "2.4 MB", type: "auto", status: "completed" },
    { id: 2, name: "Backup_2024_12_18", date: "2024-12-18", size: "2.3 MB", type: "auto", status: "completed" },
    { id: 3, name: "Manual_2024_12_17", date: "2024-12-17", size: "2.4 MB", type: "manual", status: "completed" },
  ];

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900 transition-colors">
      {/* Compact Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("settings")}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                {t("managePreferences")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 p-4">
        {/* Compact Sidebar */}
        <div className="lg:w-56 flex-shrink-0">
          <nav className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
            <div className="space-y-1">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${
                    activeTab === tab.id
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200"
                  } ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  {tab.icon}
                  <span className="truncate">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* System Status - Compact */}
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">{t("lastBackup")}</span>
                  <span className="text-green-600 dark:text-green-400">2h ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">{t("storage")}</span>
                  <span>2.5/10 GB</span>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Main Content - Compact */}
        <div className="flex-1 min-w-0">
          {/* Backup & Restore Tab */}
          {activeTab === "backup" && (
            <div className="space-y-4">
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Cloud size={16} className="text-blue-500" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t("createBackup")}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {t("createBackupDesc")}
                  </p>
                  <button className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors">
                    <Download size={14} />
                    {t("backupNow")}
                  </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Upload size={16} className="text-green-500" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t("restore")}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {t("restoreDesc")}
                  </p>
                  <button className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Upload size={14} />
                    {t("restoreBackup")}
                  </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Settings2 size={16} className="text-purple-500" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t("autoBackup")}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {t("autoBackupDesc")}
                  </p>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <div className="relative inline-flex items-center">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-8 h-4 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{t("enabled")}</span>
                  </label>
                </div>
              </div>

              {/* Backup History */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Clock size={14} />
                    {t("backupHistory")}
                  </h3>
                </div>
                <div className="p-3">
                  <div className="space-y-2">
                    {backupHistory.map((backup) => (
                      <div key={backup.id} className="flex items-center justify-between p-2 border border-gray-100 dark:border-gray-700 rounded-md text-xs">
                        <div className="flex items-center gap-2">
                          <Archive size={12} className="text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {backup.name}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400">
                              {backup.date} • {backup.size}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-xs ${
                            backup.type === 'auto' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          }`}>
                            {backup.type}
                          </span>
                          <CheckCircle size={12} className="text-green-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-1.5">
                  <Settings2 size={14} />
                  {t("advancedSettings")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-1.5">
                      {t("backupFrequency")}
                    </label>
                    <select className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs focus:ring-1 focus:ring-blue-500">
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-1.5">
                      {t("retentionPeriod")}
                    </label>
                    <select className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs focus:ring-1 focus:ring-blue-500">
                      <option>30 days</option>
                      <option>90 days</option>
                      <option>1 year</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab - Compact */}
          {activeTab === "security" && (
            <div className="space-y-4">
              <ChangePasswordSection isRTL={isRTL} />
              
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-1.5">
                  <Shield size={14} />
                  {t("securityFeatures")}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 border border-gray-100 dark:border-gray-700 rounded-md">
                    <div>
                      <div className="text-xs font-medium text-gray-900 dark:text-white">
                        {t("twoFactor")}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {t("twoFactorDesc")}
                      </div>
                    </div>
                    <button className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors">
                      {t("enable")}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 border border-gray-100 dark:border-gray-700 rounded-md">
                    <div>
                      <div className="text-xs font-medium text-gray-900 dark:text-white">
                        {t("sessionManagement")}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {t("manageSessions")}
                      </div>
                    </div>
                    <button className="px-2 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      {t("view")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab - Compact */}
          {activeTab === "appearance" && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-1.5">
                  <Moon size={14} />
                  {t("theme")}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-700 dark:text-gray-300">{t("darkMode")}</span>
                  <DarkModeToggle />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-1.5">
                  <Palette size={14} />
                  {t("colorTheme")}
                </h3>
                <ColorThemePicker />
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  {t("language")}
                </h3>
                <LanguageSwitcher />
              </div>
            </div>
          )}

          {/* General Tab - Compact */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  {t("profile")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-1">{t("name")}</label>
                    <input
                      type="text"
                      className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 text-xs"
                      placeholder={t("enterName")}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-1">{t("email")}</label>
                    <input
                      type="email"
                      className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 text-xs"
                      placeholder="user@example.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}