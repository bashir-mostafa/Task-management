// src/pages/UsersPage.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import UserTable from "../components/UserTable";
import UserFilters from "../components/UserFilters";
import UserModal from "../components/UserModal";
import DeleteConfirmationModal from "../../../../components/UI/DeleteConfirmationModal";
import Toast from "../../../../components/Toast";
import CustomDropdown from "../../../../components/UI/Dropdown";

import { userService } from "../services/userService";
import useDarkMode from "../../../../hooks/useDarkMode";
import { useAuth } from "../../../../contexts/AuthContext";

export default function UsersPage() {
  const { t, i18n } = useTranslation();
  const { isDark, colorTheme } = useDarkMode();
  const { state: authState } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    username: "",
    email: "",
    role: " ",
    sortBy:"username",
  });

  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 20,
    totalCount: 0,
  });

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState("");

  const isRTL = i18n.language === "ar";
  const currentUser = authState.user;

  // Toast State
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        ...filters,
        PageNumber: pagination.pageNumber,
        PageSize: pagination.pageSize,
        IsDeleted: false
      };

      const result = await userService.getUsers(params);
      setUsers(result.data);
      setPagination((prev) => ({ ...prev, totalCount: result.totalCount }));
    } catch (error) {
      showToast(t("fetchError"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters, pagination.pageNumber, pagination.pageSize]);

  const handleResetFilters = () => {
    setFilters({
      username: "",
      email: "",
      role: "",
      sortBy: "username",
    });
    setPagination((prev) => ({ ...prev, pageNumber: 1 }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, pageNumber: 1 }));
  };

  const handlePageSizeChange = (size) => {
    setPagination((prev) => ({
      ...prev,
      pageSize: size,
      pageNumber: 1,
    }));
  };

  // Delete single user
  const handleDelete = async (id) => {
    if (id === currentUser?.id) {
      showToast(t("cannotDeleteCurrentUser"), "error");
      return;
    }

    try {
      await userService.deleteUser(id);
      await fetchUsers();
      setSelectedUsers((prev) => prev.filter((userId) => userId !== id));

      showToast(t("userDeletedSuccessfully"), "success");
    } catch (error) {
      showToast(t("deleteError"), "error");
    }
  };

  // Delete multiple users
  const handleDeleteMultiple = async () => {
    const usersToDelete = selectedUsers.filter((id) => id !== currentUser?.id);

    if (usersToDelete.length === 0) {
      showToast(t("cannotDeleteCurrentUser"), "error");
      setDeleteModalOpen(false);
      return;
    }

    try {
      await userService.deleteMultipleUsers(usersToDelete);
      await fetchUsers();
      setSelectedUsers([]);
      setDeleteModalOpen(false);

      showToast(t("userDeletedSuccessfully"), "success");
    } catch (error) {
      showToast(t("deleteError"), "error");
    }
  };

  const handleEdit = (user) => {
    if (user.id === currentUser?.id) {
      showToast(t("cannotEditCurrentUser"), "error");
      return;
    }
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = async (userData) => {
    try {
      if (editingUser) {
        if (userData.password) {
          await userService.adminChangePassword({
            id: editingUser.id,
            password: userData.password,
          });

          showToast(t("userUpdatedSuccessfully"), "success");
        }
      } else {
        await userService.createUser(userData);
        showToast(t("userCreatedSuccessfully"), "success");
      }

      handleModalClose();
      await fetchUsers();
    } catch (error) {
      showToast(t("saveError"), "error");
    }
  };

  const filteredSelectedUsers = selectedUsers.filter(
    (id) => id !== currentUser?.id
  );

  // خيارات حجم الصفحة للـ Dropdown
  const pageSizeOptions = [
    { value: 10, label: "10" },
    { value: 20, label: "20" },
    { value: 50, label: "50" },
  ];

  return (
    <div className="min-h-screen p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      {/* HEADER */}
      <div
        className={`flex justify-between items-center mb-6 `}
      >
        <div>
          <h1 className="text-3xl font-bold">{t("usersManagement")}</h1>
          {currentUser && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t("loggedInAs")}: {currentUser.username} ({t(currentUser.role)})
            </p>
          )}
        </div>

        <div className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
          {filteredSelectedUsers.length > 0 && (
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2"
            >
              <span>{t("deleteSelected")}</span>
              <span className="bg-red-600 px-2 py-1 rounded-full text-xs">
                {filteredSelectedUsers.length}
              </span>
            </button>
          )}

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg shadow-lg"
          >
            + {t("addUser")}
          </button>
        </div>
      </div>

      {/* Filters */}
      <UserFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        className="mb-6"
      />

      {/* Pagination info */}
      <div
        className={`flex justify-between items-center mb-4 ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          <span className="text-sm text-gray-600 dark:text-gray-400">{t("show")}</span>
          
          {/* استخدام CustomDropdown بدلاً من select */}
          <CustomDropdown
            options={pageSizeOptions}
            value={pagination.pageSize}
            onChange={handlePageSizeChange}
            placeholder="20"
            isRTL={isRTL}
            size="small"
            className="w-20"
          />
          
          <span className="text-sm text-gray-600 dark:text-gray-400">{t("entries")}</span>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          {t("showing")} {(pagination.pageNumber - 1) * pagination.pageSize + 1} -{" "}
          {Math.min(pagination.pageNumber * pagination.pageSize, pagination.totalCount)}{" "}
          {t("of")} {pagination.totalCount}
        </div>
      </div>

      {/* User Table */}
      <UserTable
        users={users}
        loading={loading}
        selectedUsers={selectedUsers}
        onSelectUser={setSelectedUsers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        currentUserId={currentUser?.id}
        pagination={pagination}
        onPageChange={(page) =>
          setPagination((prev) => ({ ...prev, pageNumber: page }))
        }
      />

      {/* Modals */}
      <UserModal
        open={modalOpen}
        onClose={handleModalClose}
        onSave={handleSaveUser}
        user={editingUser}
      />

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteMultiple}
        count={filteredSelectedUsers.length}
      />

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
}