// UserModal.jsx - التعديلات
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, User } from 'lucide-react';
import UserForm from './UserForm/UserForm';
import useDarkMode from '../../../../hooks/useDarkMode';

export default function UserModal({ open, onClose, onSave, user }) {
  const { t, i18n } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { colorTheme } = useDarkMode();

  const isRTL = i18n.language === 'ar';
  const isEditing = !!user;

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
      <div 
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-full max-w-2xl my-4"
        onClick={(e) => e.stopPropagation()}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* الهيدر ثابت */}
        <div className={`sticky top-0 z-10 flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-xl ${
          isRTL ? 'flex-row-reverse' : ''
        }`}>
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
              <User size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                {isEditing ? t('editUser') : t('addUser')}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isEditing ? t('updatePasswordOnly') : t('createNewUser')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={16} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* المحتوى مع Scroll */}
        <div className="max-h-[70vh] overflow-y-auto">
          <UserForm
            user={user}
            onSubmit={handleSubmit}
            onClose={onClose}
            isSubmitting={isSubmitting}
            isRTL={isRTL}
            colorTheme={colorTheme}
          />
        </div>
      </div>
    </div>
  );
}