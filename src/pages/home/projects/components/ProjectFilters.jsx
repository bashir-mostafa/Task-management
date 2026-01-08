import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Filter,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import CustomDropdown from "../../../../components/UI/Dropdown";
import InputField from "../../../../components/UI/InputField";

export default function ProjectFilters({
  filters,
  onFilterChange,
  onReset,
  className = "",
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [showFilters, setShowFilters] = useState(false);
  const [managers, setManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);

 

  const handleChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "" && value !== null && value !== undefined
  );

  // خيارات الحالة
  const statusOptions = [
    { value: "", label: t("allStatuses") },
    { value: "planning", label: t("planning") },
    { value: "Underimplementation", label: t("underImplementation") },
    { value: "Complete", label: t("complete") },
    { value: "Pause", label: t("pause") },
    { value: "Notimplemented", label: t("notImplemented") },
  ];



  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}
      dir={isRTL ? "rtl" : "ltr"}>
      {/* رأس الفلتر */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div
          className={`flex items-center justify-between ${
            isRTL ? "flex-row-reverse" : ""
          }`}>
          {/* الجزء الأيمن - زر إظهار/إخفاء الفلتر */}
          <div
            className={`flex items-center gap-3 ${
              isRTL ? "flex-row-reverse" : ""
            }`}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${
                isRTL ? "flex-row-reverse" : ""
              }`}>
              {showFilters ? (
                <>
                  <span>{t("hideFilters")}</span>
                  <ChevronUp size={16} />
                </>
              ) : (
                <>
                  <span>{t("showFilters")}</span>
                  <ChevronDown size={16} />
                </>
              )}
            </button>
          </div>

          {/* الجزء الأيسر - العنوان ومؤشر الفلتر النشط */}
          <div
            className={`flex items-center gap-3 ${
              isRTL ? "flex-row-reverse" : ""
            }`}>
            {hasActiveFilters && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-primary font-medium">
                  {t("active")}
                </span>
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-primary" />
              <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                {t("filters")}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* محتوى الفلتر */}
      {showFilters && (
        <div className="p-4">
          {/* الفلاتر الأساسية */}
          <div
            className={`grid grid-cols-2 md:grid-cols-2 gap-4 mb-4  ${
              isRTL ? "text-right" : "text-left"
            }`}>
            {/* بحث بالاسم */}
            <div className={`w-50 h-10  ${isRTL ? "text-right" : "text-left"}`}>
              <InputField
                label={t("searchByName")}
                value={filters.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder={t("enterProjectName")}
                Icon={Search}
                error={null}
                dir={isRTL ? "rtl" : "ltr"}
                iconPosition="right"
                className="w-full h-10"
              />
            </div>
            <div>
              {/* فلترة بالحالة */}
              <div className={isRTL ? "text-right" : "text-left"}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t("filterByStatus")}
                </label>
                <CustomDropdown
                  options={statusOptions}
                  value={filters.status}
                  onChange={(value) => handleChange("status", value)}
                  placeholder={t("allStatuses")}
                  isRTL={isRTL}
                  className="w-full mb-2"
                />
              </div>

            </div>
          </div>

          {/* زر الإعادة */}
          <div className={`flex ${isRTL ? "justify-end" : "justify-start"}`}>
            {hasActiveFilters && (
              <button
                onClick={onReset}
                className={`flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                  isRTL ? "flex-row-reverse" : ""
                }`}>
                <span>{t("resetFilters")}</span>
                <RotateCcw size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
