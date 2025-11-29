// src/components/DeleteConfirmationModal.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, AlertTriangle, Users, User } from 'lucide-react';

export default function DeleteConfirmationModal({ 
  open, 
  onClose, 
  onConfirm, 
  itemName, 
  type = 'user',
  count = 1
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  if (!open) return null;

  const getTitle = () => {
    switch (type) {
      case 'user':
        return count > 1 ? t('deleteUsers') : t('deleteUser');
      case 'project':
        return count > 1 ? t('deleteProjects') : t('deleteProject');
      case 'task':
        return count > 1 ? t('deleteTasks') : t('deleteTask');
      default:
        return count > 1 ? t('deleteItems') : t('deleteItem');
    }
  };

  const getMessage = () => {
    if (count > 1) {
      switch (type) {
        case 'user':
          return t('deleteUsersConfirmation', { count });
        case 'project':
          return t('deleteProjectsConfirmation', { count });
        case 'task':
          return t('deleteTasksConfirmation', { count });
        default:
          return t('deleteItemsConfirmation', { count });
      }
    } else {
      switch (type) {
        case 'user':
          return t('deleteUserConfirmation', { name: itemName });
        case 'project':
          return t('deleteProjectConfirmation', { name: itemName });
        case 'task':
          return t('deleteTaskConfirmation', { name: itemName });
        default:
          return t('deleteItemConfirmation', { name: itemName });
      }
    }
  };

  const getIcon = () => {
    if (count > 1) {
      return <Users size={24} className="text-red-500 dark:text-red-400" />;
    }
    switch (type) {
      case 'user':
        return <User size={24} className="text-red-500 dark:text-red-400" />;
      case 'project':
        return <AlertTriangle size={24} className="text-red-500 dark:text-red-400" />;
      case 'task':
        return <AlertTriangle size={24} className="text-red-500 dark:text-red-400" />;
      default:
        return <AlertTriangle size={24} className="text-red-500 dark:text-red-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-w-md w-full animate-scale-in">
        {/* الهيدر */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              {getIcon()}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getTitle()}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* الرسالة */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
            {getMessage()}
          </p>
          <p className="text-red-500 dark:text-red-400 text-sm text-center mt-2 font-medium">
            {t('thisActionCannotBeUndone')}
          </p>
        </div>

        {/* الأزرار */}
        <div className={`flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
          >
            {t('cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
          >
            <AlertTriangle size={16} />
            {t('delete')}
          </button>
        </div>
      </div>
    </div>
  );
}