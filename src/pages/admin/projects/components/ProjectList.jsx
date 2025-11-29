import React, { useState } from "react";
import ProjectCard from "./ProjectCard";
import Pagination from "./Pagination";

const ProjectList = ({
  projects,
  filters,
  onFilterChange,
  onEdit,
  onDelete,
  loading,
  pagination,
  onPageChange,
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
  };

  const resetFilters = () => {
    const reset = {
      name: "",
      status: "",
      project_manager_id: "",
      start_date_from: "",
      start_date_to: "",
      end_date_from: "",
      end_date_to: "",
      success_rate: "",
    };
    setLocalFilters(reset);
    onFilterChange(reset);
  };

  // SVG Icons
  const FilterIcon = () => (
    <svg
      className="w-5 h-5 text-blue-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
      />
    </svg>
  );

  const SearchIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );

  const ResetIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          جاري تحميل المشاريع...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* فلترة */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center space-x-2 space-x-reverse">
            <FilterIcon />
            <span>فلترة المشاريع</span>
          </h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            {showFilters ? "إخفاء الفلترة" : "إظهار الفلترة"}
          </button>
        </div>
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                اسم المشروع
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={localFilters.name}
                onChange={(e) => handleFilterChange("name", e.target.value)}
                placeholder="ابحث باسم المشروع..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                الحالة
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={localFilters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}>
                <option value="">جميع الحالات</option>
                <option value="planning">قيد التخطيط</option>
                <option value="active">نشط</option>
                <option value="complete">مكتمل</option>
                <option value="pause">متوقف</option>
                <option value="underimplemented">غير مكتمل</option>
                <option value="notimplemented">ملغي</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                مدير المشروع
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={localFilters.project_manager_id}
                onChange={(e) =>
                  handleFilterChange("project_manager_id", e.target.value)
                }
                placeholder="رقم مدير المشروع"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                من تاريخ البدء
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={localFilters.start_date_from}
                onChange={(e) =>
                  handleFilterChange("start_date_from", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                إلى تاريخ البدء
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={localFilters.start_date_to}
                onChange={(e) =>
                  handleFilterChange("start_date_to", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                من تاريخ الانتهاء
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={localFilters.end_date_from}
                onChange={(e) =>
                  handleFilterChange("end_date_from", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                إلى تاريخ الانتهاء
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={localFilters.end_date_to}
                onChange={(e) =>
                  handleFilterChange("end_date_to", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                معدل النجاح
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={localFilters.success_rate}
                onChange={(e) =>
                  handleFilterChange("success_rate", e.target.value)
                }
                placeholder="معدل النجاح"
              />
            </div>
            <div className="flex items-end space-x-2 space-x-reverse">
              <button
                onClick={applyFilters}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 space-x-reverse">
                <SearchIcon />
                <span>تطبيق</span>
              </button>
              <button
                onClick={resetFilters}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2 space-x-reverse">
                <ResetIcon />
                <span>إعادة تعيين</span>
              </button>
            </div>
          </div>
        )}
      </div>
      {/* إحصائيات */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center space-x-2 space-x-reverse text-blue-800 dark:text-blue-200">
          <span>📊</span>
          <span>
            عرض {projects.length} من أصل {pagination.totalCount} مشروع
          </span>
        </div>
      </div>
      {/* قائمة المشاريع */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              لا توجد مشاريع
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              لم يتم العثور على أي مشاريع تطابق معايير البحث
            </p>
          </div>
        ) : (
          projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
      {projects.length > 0 && (
        <Pagination
          currentPage={pagination.pageNumber}
          totalPages={Math.ceil(pagination.totalCount / pagination.pageSize)}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default ProjectList;
