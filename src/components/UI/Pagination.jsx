// src/components/UI/Pagination.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * مكون Pagination موحد لجميع أنحاء المشروع
 * @param {Object} props
 * @param {Object} props.pagination - معلومات الترقيم
 * @param {number} props.pagination.pageNumber - الصفحة الحالية
 * @param {number} props.pagination.pageSize - عدد العناصر في الصفحة
 * @param {number} props.pagination.totalCount - إجمالي عدد العناصر
 * @param {Function} props.onPageChange - دالة تغيير الصفحة
 * @param {string} props.itemsName - اسم العناصر (اختياري)
 * @param {boolean} props.showProgress - عرض شريط التقدم (اختياري)
 * @param {string} props.className - classes إضافية (اختياري)
 */
export default function Pagination({ 
  pagination, 
  onPageChange, 
  itemsName = 'items',
  showProgress = true,
  className = ''
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const { pageNumber, pageSize, totalCount } = pagination;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = (pageNumber - 1) * pageSize + 1;
  const endItem = Math.min(pageNumber * pageSize, totalCount);

  // إنشاء مجموعة أرقام الصفحات للعرض
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (pageNumber <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (pageNumber >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = pageNumber - 1; i <= pageNumber + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`px-6 py-4 border-t border-border bg-background ${className} ${
      isRTL ? 'text-right' : 'text-left'
    }`}>
      <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
        {/* معلومات الصفحة */}
        <div className="text-sm text-text/80">
          {t('showing')} <span className="font-semibold text-text">{startItem}-{endItem}</span> {' '}
          {t('of')} <span className="font-semibold text-text">{totalCount}</span> {t(itemsName)}
        </div>
        
        {/* أزرار التنقل */}
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* زر الصفحة السابقة */}
          <button
            onClick={() => onPageChange(pageNumber - 1)}
            disabled={pageNumber === 1}
            className={`flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium text-text disabled:opacity-50 disabled:cursor-not-allowed hover:bg-text/5 hover:border-text/20 transition-all duration-200 shadow-sm hover:shadow-md ${
              isRTL ? 'flex-row-reverse' : ''
            }`}
          >
            {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            <span className="hidden sm:inline">{t('previous')}</span>
          </button>
          
          {/* أرقام الصفحات */}
          <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {getPageNumbers().map((pageNum, index) => (
              <button
                key={index}
                onClick={() => typeof pageNum === 'number' && onPageChange(pageNum)}
                disabled={typeof pageNum !== 'number'}
                className={`min-w-[42px] h-10 flex items-center justify-center px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pageNum === pageNumber
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg transform scale-105 border border-primary'
                    : typeof pageNum === 'number'
                    ? 'bg-background border border-border text-text hover:bg-text/5 hover:border-text/20 hover:shadow-md'
                    : 'text-text/40 cursor-default bg-transparent border-transparent'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>
          
          {/* زر الصفحة التالية */}
          <button
            onClick={() => onPageChange(pageNumber + 1)}
            disabled={pageNumber === totalPages}
            className={`flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium text-text disabled:opacity-50 disabled:cursor-not-allowed hover:bg-text/5 hover:border-text/20 transition-all duration-200 shadow-sm hover:shadow-md ${
              isRTL ? 'flex-row-reverse' : ''
            }`}
          >
            <span className="hidden sm:inline">{t('next')}</span>
            {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </div>

      
    </div>
  );
}