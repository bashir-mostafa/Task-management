// src/pages/admin/users/components/UserTable.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Trash2, Loader } from 'lucide-react';
import Pagination from '../../../../components/UI/Pagination';
import DeleteConfirmationModal from '../../../../components/UI/DeleteConfirmationModal';

export default function UserTable({
  users,
  loading,
  selectedUsers,
  onSelectUser,
  onEdit,
  onDelete,
  pagination,
  onPageChange,
  currentUserId
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);

  const toggleSelectAll = (checked) => {
    if (checked) {
      // استبعاد المستخدم الحالي من التحديد
      const selectableUsers = users.filter(user => user.id !== currentUserId);
      onSelectUser(selectableUsers.map(user => user.id));
    } else {
      onSelectUser([]);
    }
  };

  const toggleSelectUser = (id, checked) => {
    // منع تحديد المستخدم الحالي
    if (id === currentUserId) return;
    
    if (checked) {
      onSelectUser([...selectedUsers, id]);
    } else {
      onSelectUser(selectedUsers.filter(userId => userId !== id));
    }
  };

  // فتح modal حذف مستخدم واحد
  const handleDeleteClick = (userId) => {
    const user = users.find(u => u.id === userId);
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  // فتح modal حذف جماعي
  const handleBulkDeleteClick = () => {
    setBulkDeleteModalOpen(true);
  };

  // تأكيد حذف مستخدم واحد
  const handleConfirmDelete = () => {
    if (userToDelete) {
      onDelete(userToDelete.id);
    }
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  // تأكيد الحذف الجماعي
  const handleConfirmBulkDelete = () => {
    // استدعاء onDelete مع جميع الـ IDs المحددة
    selectedUsers.forEach(userId => {
      onDelete(userId);
    });
    setBulkDeleteModalOpen(false);
  };

  const handleCloseModal = () => {
    setDeleteModalOpen(false);
    setBulkDeleteModalOpen(false);
    setUserToDelete(null);
  };

  // التحقق مما إذا كان المستخدم هو المستخدم الحالي
  const isCurrentUser = (userId) => userId === currentUserId;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div 
        className="bg-navbar-light dark:bg-navbar-dark rounded-xl shadow-lg border border-border overflow-hidden"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* الجدول */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-gray-50 dark:bg-gray-800">
                <th className="px-4 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={users.length > 0 && selectedUsers.length === users.filter(user => user.id !== currentUserId).length}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                  />
                </th>
                
                <th className={`px-4 py-4 text-sm font-medium text-navbar-text-light dark:text-navbar-text-dark ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('username')}
                </th>
                <th className={`px-4 py-4 text-sm font-medium text-navbar-text-light dark:text-navbar-text-dark ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('email')}
                </th>
                <th className={`px-4 py-4 text-sm font-medium text-navbar-text-light dark:text-navbar-text-dark ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('role')}
                </th>
                <th className={`px-4 py-4 text-sm font-medium text-navbar-text-light dark:text-navbar-text-dark ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900">
              {users.length === 0 ? (
                <tr>
                  <td 
                    colSpan="5" 
                    className={`px-4 py-8 text-center text-gray-500 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    {t('noUsersFound')}
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isCurrent = isCurrentUser(user.id);
                  return (
                    <tr 
                      key={user.id} 
                      className={`border-b border-border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        isCurrent ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => toggleSelectUser(user.id, e.target.checked)}
                          disabled={isCurrent}
                          className={`w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary ${
                            isCurrent ? 'opacity-40 cursor-not-allowed' : ''
                          }`}
                        />
                      </td>
                      
                      <td className={`px-4 py-4 text-text ${isRTL ? 'text-right' : 'text-left'}`}>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {user.username}
                          {isCurrent && (
                            <span className={`px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full ${isRTL ? 'mr-2' : 'ml-2'}`}>
                              {t('you')}
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className={`px-4 py-4 text-text ${isRTL ? 'text-right' : 'text-left'}`}>
                        <div className="text-gray-600 dark:text-gray-300">
                          {user.email}
                        </div>
                      </td>
                      
                      <td className={`px-4 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'Admin' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : user.role === 'User'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {t(user.role?.toLowerCase() || 'user')}
                          {isCurrent && ` (${t('you')})`}
                        </span>
                      </td>
                      
                      <td className={`px-4 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <button
                            onClick={() => onEdit(user)}
                            disabled={false}
                            className={`p-2 rounded-lg transition-colors ${
                              isCurrent 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                            }`}
                            title={isCurrent ? t('cannotEditCurrentUser') : t('edit')}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user.id)}
                            disabled={isCurrent}
                            className={`p-2 rounded-lg transition-colors ${
                              isCurrent 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30'
                            }`}
                            title={isCurrent ? t('cannotDeleteCurrentUser') : t('delete')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* استخدام مكون Pagination الموحد */}
        {pagination.totalCount > 0 && (
          <Pagination
            pagination={pagination}
            onPageChange={onPageChange}
            itemsName="users"
            showProgress={true}
          />
        )}
      </div>

      {/* Modal تأكيد حذف مستخدم واحد */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        itemName={userToDelete?.username}
        type="user"
        count={1}
      />

      {/* Modal تأكيد الحذف الجماعي */}
      <DeleteConfirmationModal
        open={bulkDeleteModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmBulkDelete}
        itemName=""
        type="user"
        count={selectedUsers.length}
      />
    </>
  );
}