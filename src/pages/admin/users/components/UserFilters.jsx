// src/components/Users/UserFilters.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Filter, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import CustomDropdown from "../../../../components/UI/Dropdown";
import InputField from "../../../../components/UI/InputField";

export default function UserFilters({
  filters,
  onFilterChange,
  onReset,
  className = "",
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [showFilters, setShowFilters] = useState(false);

  const handleChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters = filters.username || filters.email || filters.role;

  // خيارات الأدوار
  const roleOptions = [
    { value: "", label: t("allRoles") },
    { value: "Admin", label: t("admin") },
    { value: "User", label: t("user") },
  ];

  // خيارات الترتيب
  const sortOptions = [
    { value: "username", label: t("username") },
    { value: "email", label: t("email") },
    { value: "role", label: t("role") },
  ];

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* رأس الفلتر مع زر الإظهار/الإخفاء */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div
          className={`flex items-center justify-between ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Filter size={20} className="text-[rgb(var(--color-primary))]" />
            <h3 className="font-medium text-gray-900 dark:text-white">
              {t("filters")}
            </h3>
            {hasActiveFilters && (
              <span className="px-2 py-1 text-xs bg-[rgb(var(--color-primary))] text-white rounded-full">
                {t("active")}
              </span>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            {showFilters ? (
              <>
                <ChevronUp size={16} />
                <span>{t("hideFilters")}</span>
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                <span>{t("showFilters")}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* محتوى الفلتر (قابل للطي) */}
      {showFilters && (
        <div className="p-4">
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            {/* بحث بالاسم باستخدام InputField */}
            <div>
              <InputField
                label={t("searchByUsername")}
                value={filters.username}
                onChange={(e) => handleChange("username", e.target.value)}
                placeholder={t("enterUsername")}
                Icon={Search}
                error={null}
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>

            {/* بحث بالإيميل باستخدام InputField */}
            <div>
              <InputField
                label={t("searchByEmail")}
                value={filters.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder={t("enterEmail")}
                error={null}
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>

            {/* فلترة بالدور باستخدام CustomDropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("filterByRole")}
              </label>
              <CustomDropdown
                options={roleOptions}
                value={filters.role}
                onChange={(value) => handleChange("role", value)}
                placeholder={t("allRoles")}
                isRTL={isRTL}
                className="min-w-1"
              />
            </div>

            {/* ترتيب باستخدام CustomDropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("sortBy")}
              </label>
              <CustomDropdown
                options={sortOptions}
                value={filters.sortBy}
                onChange={(value) => handleChange("sortBy", value)}
                placeholder={t("sortBy")}
                isRTL={isRTL}
                className="w-full"
              />
            </div>
          </div>

          {/* زر الإعادة في الأسفل */}
          <div
            className={`flex items-center ${
              isRTL ? "justify-start" : "justify-end"
            }`}
          >
            {hasActiveFilters && (
              <button
                onClick={onReset}
                className={`flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <RotateCcw size={16} />
                {t("resetFilters")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}