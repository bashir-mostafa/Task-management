// src/components/Layout/DataTableLayout.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Plus, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../UI/Button";
import Input from "../UI/InputField";
import Select from "../UI/Select";
import Pagination from "../UI/Pagination";

export default function DataTableLayout({
  children,
  title,
  subtitle,
  backUrl,
  backLabel,
  showBackButton = true,
  showAddButton = true,
  addButtonLabel,
  onAddClick,
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  filters,
  onFilterChange,
  currentPage,
  totalPages,
  onPageChange,
  stats,
  loading = false,
  error = null,
  isEmpty = false,
  emptyMessage,
  emptyAction,
  isRTL = false,
  hiddenStats = false,
  projectId,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
          role="status"
          aria-label="Loading"
        >
          <span className="sr-only">{t("loading")}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <div className="text-red-500 text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-text mb-4">{error}</h2>
        {backUrl && (
          <Button onClick={() => navigate(backUrl)} className="!w-auto px-6 py-3">
            {backLabel || t("back")}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
              {showBackButton && backUrl && (
                <Button
                  onClick={() => navigate(backUrl)}
                  variant="secondary"
                  className={`flex items-center gap-2 !w-auto h-10 px-4 py-2 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <ArrowLeft size={20} />
                  <span>{backLabel || t("back")}</span>
                </Button>
              )}

              <div className={isRTL ? "text-right" : "text-left"}>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {showAddButton && onAddClick && (
              <Button
                onClick={onAddClick} // تصحيح: استخدام onAddClick مباشرة
                className={`flex items-center gap-2 !w-auto h-10 px-4 py-2 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <Plus size={20} />
                <span>{addButtonLabel || t("add")}</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Grid */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`text-center p-4 rounded-xl border cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] bg-gradient-to-br ${stat.color} ${stat.onClick ? "cursor-pointer" : ""}`}
                onClick={stat.onClick}
              >
                <div className={`text-2xl md:text-3xl font-bold ${stat.valueColor || "text-gray-800 dark:text-white"}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {t(stat.title)}
                </div>
                {stat.subValue && (
                  <div className={`text-xs ${stat.subValueColor || "text-gray-500 dark:text-gray-400"} mt-2`}>
                    {stat.subValue}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Filters and Search */}
        {(searchTerm !== undefined || filters) && (
          <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 border border-gray-200/50 dark:border-gray-600/50 ${isRTL ? "text-right" : ""}`}>
            <div className={`flex flex-col md:flex-row items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
              {searchTerm !== undefined && (
                <div className="flex-1 w-full">
                  <div className="relative">
                    <Search
                      size={20}
                      className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 ${isRTL ? "right-3" : "left-3"}`}
                    />
                    <Input
                      type="text"
                      placeholder={searchPlaceholder || t("search")}
                      value={searchTerm}
                      onChange={(e) => onSearchChange(e.target.value)}
                      className={`${isRTL ? "pr-10" : "pl-10"} w-full`}
                      isRTL={isRTL}
                    />
                  </div>
                </div>
              )}

              {filters && filters.length > 0 && (
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  {filters.map((filter, index) => (
                    <Select
                      key={index}
                      value={filter.value}
                      onChange={(e) => filter.onChange(e.target.value)}
                      className="!w-auto"
                      icon={filter.icon}
                    >
                      {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        {isEmpty ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">
              {emptyAction ? "📋" : "📄"}
            </div>
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
              {emptyMessage || t("noData")}
            </h3>
            {emptyAction && (
              <div className="mt-4">
                <Button onClick={emptyAction.onClick}>
                  {emptyAction.label}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            {children}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={onPageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}