import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  UserPlus,
  Users,
  X,
  UserMinus,
  Search,
  Shield,
  User as UserIcon,
  UserCheck,
} from "lucide-react";
import { userProjectService } from "../../services/userProjectService";
import { projectService } from "../../services/projectService";
import { userService } from "../../../users/services/userService"; // إضافة خدمة المستخدمين
import DetailsLayout from "../../../../../components/Layout/DetailsLayout";
import DetailsCard from "../../../../../components/UI/DetailsCard";
import StatCard from "../../../../../components/UI/StatCard";
import Button from "../../../../../components/UI/Button";
import Modal from "../../../../../components/UI/Modal";
import DeleteConfirmationModal from "../../../../../components/UI/DeleteConfirmationModal";
import Toast from "../../../../../components/Toast";

export default function ProjectUsersPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState(null);
  const [allUsers, setAllUsers] = useState([]); // جميع المستخدمين
  const [currentProjectUsers, setCurrentProjectUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userToRemove, setUserToRemove] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addUsersModalOpen, setAddUsersModalOpen] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const isRTL = i18n.language === "ar";

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // جلب تفاصيل المشروع
        const projectResult = await projectService.getProjectById(projectId);
        if (projectResult.project) {
          setProject(projectResult.project);
        }

        // جلب جميع المستخدمين
        const usersResponse = await userService.getUsers();
        const allUsersList = usersResponse.data || [];

        // تصفية المستخدمين غير المحذوفين فقط
        const activeUsers = allUsersList.filter((user) => !user.isDeleted);
        setAllUsers(activeUsers);

        // جلب مستخدمي المشروع
        try {
          const projectUsersResponse = await userProjectService.getProjectUsers(
            projectId
          );
          setCurrentProjectUsers(projectUsersResponse?.data || []);
        } catch (err) {
          console.warn("Could not fetch project users:", err);
          setCurrentProjectUsers([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        showToast(error.response?.data?.message || t("fetchError"), "error");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId, t, showToast]);

  // إحصائيات
  const statistics = {
    totalUsers: currentProjectUsers.length,
    available: allUsers.length - currentProjectUsers.length,
    selected: selectedUsers.length,
    admins: currentProjectUsers.filter((user) => user.role === 1).length,
    regularUsers: currentProjectUsers.filter((user) => user.role === 2).length,
  };

  // إزالة مستخدم من المشروع
  const handleRemoveUser = async (userId) => {
    try {
      setLoading(true);
      await userProjectService.removeUserFromProject(projectId, userId);

      // تحديث القائمة محلياً
      setCurrentProjectUsers((prev) =>
        prev.filter((user) => user.id !== userId)
      );
      setDeleteModalOpen(false);
      setUserToRemove(null);

      showToast(t("userRemovedSuccessfully"), "success");
    } catch (error) {
      console.error("Error removing user from project:", error);
      showToast(t("removeUserError"), "error");
    } finally {
      setLoading(false);
    }
  };

  // إضافة مستخدمين إلى المشروع
  const handleAddUsers = async () => {
    const usersToAdd = selectedUsers.filter(
      (id) => !currentProjectUsers.some((u) => u.id === id)
    );

    if (usersToAdd.length === 0) {
      showToast(t("selectUsersFirst"), "warning");
      return;
    }

    try {
      setLoading(true);

      // إضافة المستخدمين للمشروع
      await userProjectService.addUsersToProject(projectId, usersToAdd);

      // إعادة جلب مستخدمي المشروع
      const projectUsersResponse = await userProjectService.getProjectUsers(
        projectId
      );
      setCurrentProjectUsers(projectUsersResponse?.data || []);

      // إعادة تعيين البيانات
      setSelectedUsers([]);
      setAddUsersModalOpen(false);
      setSearchTerm("");

      showToast(t("usersAddedSuccessfully"), "success");
    } catch (error) {
      console.error("Error adding users to project:", error);
      showToast(t("addUsersError"), "error");
    } finally {
      setLoading(false);
    }
  };

  // تصفية المستخدمين المتاحين (غير مضافين للمشروع)
  const filteredAvailableUsers = allUsers.filter(
    (user) =>
      !currentProjectUsers.some((projectUser) => projectUser.id === user.id) &&
      (user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleUserSelect = (userId) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const removeSelectedUser = (userId) => {
    setSelectedUsers((prev) => prev.filter((id) => id !== userId));
  };

  const getSelectedUsersDetails = () => {
    return allUsers.filter((user) => selectedUsers.includes(user.id));
  };

  const openRemoveConfirmation = (user) => {
    setUserToRemove(user);
    setDeleteModalOpen(true);
  };

  const handleBack = () => {
    navigate(`/projects/${projectId}`);
  };

  // اختيار كل المستخدمين المتاحين
  const selectAllAvailable = () => {
    const allAvailableIds = filteredAvailableUsers.map((user) => user.id);
    if (
      selectedUsers.filter((id) => allAvailableIds.includes(id)).length ===
      allAvailableIds.length
    ) {
      // إلغاء تحديد الكل
      setSelectedUsers((prev) =>
        prev.filter((id) => !allAvailableIds.includes(id))
      );
    } else {
      // تحديد الكل
      setSelectedUsers((prev) => [...new Set([...prev, ...allAvailableIds])]);
    }
  };

  // اختيار كل المستخدمين المضافين
  const selectAllAssigned = () => {
    const allAssignedIds = currentProjectUsers.map((user) => user.id);
    if (
      selectedUsers.filter((id) => allAssignedIds.includes(id)).length ===
      allAssignedIds.length
    ) {
      // إلغاء تحديد الكل
      setSelectedUsers((prev) =>
        prev.filter((id) => !allAssignedIds.includes(id))
      );
    } else {
      // تحديد الكل
      setSelectedUsers((prev) => [...new Set([...prev, ...allAssignedIds])]);
    }
  };

  // مسح التحديد
  const clearSelection = () => {
    setSelectedUsers([]);
  };

  return (
    <DetailsLayout
      title={t("manageProjectUsers")}
      subtitle={project ? `${t("forProject")}: ${project.name}` : ""}
      loading={loading && !project}
      error={null}
      onBack={handleBack}
      backLabel={t("backToProject")}
      isRTL={isRTL}
      showHeader={true}
      actions={
        <Button
          onClick={() => setAddUsersModalOpen(true)}
          className={`flex items-center gap-2 !w-auto px-4 py-2 ${
            isRTL ? "flex-row-reverse" : ""
          }`}>
          <UserPlus size={20} />
          <span>{t("addUsers")}</span>
        </Button>
      }>
      {/* إحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="totalUsers"
          value={statistics.totalUsers}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="admins"
          value={statistics.admins}
          icon={Shield}
          color="purple"
        />
        <StatCard
          title="regularUsers"
          value={statistics.regularUsers}
          icon={UserIcon}
          color="green"
        />
      </div>

      {/* حاوية القوائم */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        {/* المستخدمون المضافون للمشروع */}
        <DetailsCard title={t("currentProjectUsers")} icon={Users}>
          <div
            className={`flex items-center justify-between mb-3 ${
              isRTL ? "flex-row-reverse" : ""
            }`}>
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t("total")}: {currentProjectUsers.length}
              </span>
            </div>
            {currentProjectUsers.length > 0 && (
              <button
                onClick={selectAllAssigned}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                {selectedUsers.filter((id) =>
                  currentProjectUsers.some((u) => u.id === id)
                ).length === currentProjectUsers.length
                  ? t("deselectAll")
                  : t("selectAll")}
              </button>
            )}
          </div>

          {currentProjectUsers.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {currentProjectUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedUsers.includes(user.id)
                      ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700"
                      : "bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent"
                  }`}
                  onClick={() => handleUserSelect(user.id)}>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        selectedUsers.includes(user.id)
                          ? "bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300"
                          : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                      }`}>
                      <UserCheck size={14} />
                    </div>
                    <div>
                      <p className="font-medium text-text">{user.username}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                          {user.email}
                        </p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            user.role === 1
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          }`}>
                          {user.role === 1 ? t("admin") : t("user")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => {}}
                      className="w-4 h-4 text-red-600 dark:text-red-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-red-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Users size={32} className="mx-auto mb-2 opacity-50" />
              <p>{t("noUsersInProject")}</p>
            </div>
          )}
        </DetailsCard>

        {/* المستخدمون المتاحون للإضافة */}
        <DetailsCard title={t("availableUsers")} icon={UserPlus}>
          <div
            className={`flex items-center justify-between mb-3 ${
              isRTL ? "flex-row-reverse" : ""
            }`}>
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t("total")}: {filteredAvailableUsers.length}
              </span>
            </div>
            {filteredAvailableUsers.length > 0 && (
              <button
                onClick={selectAllAvailable}
                className="text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300">
                {selectedUsers.filter((id) =>
                  filteredAvailableUsers.some((u) => u.id === id)
                ).length === filteredAvailableUsers.length
                  ? t("deselectAll")
                  : t("selectAll")}
              </button>
            )}
          </div>

          {filteredAvailableUsers.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filteredAvailableUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedUsers.includes(user.id)
                      ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700"
                      : "bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent"
                  }`}
                  onClick={() => handleUserSelect(user.id)}>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        selectedUsers.includes(user.id)
                          ? "bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300"
                          : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                      }`}>
                      <UserCheck size={14} />
                    </div>
                    <div>
                      <p className="font-medium text-text">{user.username}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => {}}
                    className="w-4 h-4 text-blue-600 dark:text-blue-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <UserPlus size={32} className="mx-auto mb-2 opacity-50" />
              <p>
                {searchTerm ? t("noUsersMatchSearch") : t("allUsersAssigned")}
              </p>
            </div>
          )}
        </DetailsCard>
      </div>

      {/* المستخدمون المحددون */}
      {selectedUsers.length > 0 && (
        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <div
            className={`flex items-center justify-between mb-3 ${
              isRTL ? "flex-row-reverse" : ""
            }`}>
            <div>
              <h3 className="font-semibold text-text">
                {t("selectedUsers")} ({selectedUsers.length})
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("selectedUsersHelp")}
              </p>
            </div>
            <button
              onClick={clearSelection}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300">
              {t("clearSelection")}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {getSelectedUsersDetails().map((user) => {
              const isAssigned = currentProjectUsers.some(
                (u) => u.id === user.id
              );
              return (
                <div
                  key={user.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                    isAssigned
                      ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700"
                      : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                  }`}>
                  <span className="text-sm">{user.username}</span>
                  <button
                    type="button"
                    onClick={() => handleUserSelect(user.id)}
                    className="hover:opacity-70">
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* أزرار الإجراءات */}
          <div
            className={`flex flex-wrap gap-3 ${
              isRTL ? "flex-row-reverse" : ""
            }`}>
            <Button
              onClick={handleAddUsers}
              disabled={
                loading ||
                !selectedUsers.some(
                  (id) => !currentProjectUsers.some((u) => u.id === id)
                )
              }
              className="flex items-center gap-2 min-w-[120px] justify-center">
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <UserPlus size={16} />
              )}
              <span>{t("addSelected")}</span>
            </Button>

            <Button
              onClick={() => {
                const usersToRemove = selectedUsers.filter((id) =>
                  currentProjectUsers.some((u) => u.id === id)
                );
                if (usersToRemove.length > 0) {
                  setUserToRemove({ id: usersToRemove[0] });
                  setDeleteModalOpen(true);
                }
              }}
              variant="danger"
              disabled={
                loading ||
                !selectedUsers.some((id) =>
                  currentProjectUsers.some((u) => u.id === id)
                )
              }
              className="flex items-center gap-2 min-w-[120px] justify-center">
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <X size={16} />
              )}
              <span>{t("removeSelected")}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Modal إضافة مستخدمين */}
      <Modal
        isOpen={addUsersModalOpen}
        onClose={() => {
          setAddUsersModalOpen(false);
          setSelectedUsers([]);
          setSearchTerm("");
        }}
        title={t("addUsersToProject")}
        size="lg">
        <div className="space-y-4">
          {/* شريط البحث */}
          <div className="relative">
            <Search
              size={20}
              className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 ${
                isRTL ? "right-3" : "left-3"
              }`}
            />
            <input
              type="text"
              placeholder={t("searchUsers")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                isRTL ? "pr-10 pl-4" : ""
              }`}
            />
          </div>

          {/* المستخدمون المحددون */}
          {selectedUsers.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2">
                {t("selectedUsers")} ({selectedUsers.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {getSelectedUsersDetails().map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-3 py-2 rounded-full">
                    <span>{user.username}</span>
                    <button
                      type="button"
                      onClick={() => removeSelectedUser(user.id)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* قائمة المستخدمين المتاحين */}
          <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
            {filteredAvailableUsers.length > 0 ? (
              filteredAvailableUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-600 last:border-b-0 cursor-pointer transition-colors ${
                    selectedUsers.includes(user.id)
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => handleUserSelect(user.id)}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleUserSelect(user.id)}
                    className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <UserPlus size={32} className="mx-auto mb-2 opacity-50" />
                <p>{t("noUsersFound")}</p>
              </div>
            )}
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setAddUsersModalOpen(false);
                setSelectedUsers([]);
                setSearchTerm("");
              }}
              disabled={loading}
              className="flex-1">
              {t("cancel")}
            </Button>
            <Button
              onClick={handleAddUsers}
              disabled={loading || selectedUsers.length === 0}
              className="flex-1 flex items-center gap-2 justify-center">
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <UserPlus size={16} />
              )}
              <span>
                {selectedUsers.length > 0
                  ? t("addUsersCount", { count: selectedUsers.length })
                  : t("addUsers")}
              </span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal تأكيد الحذف */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setUserToRemove(null);
        }}
        onConfirm={() => handleRemoveUser(userToRemove?.id)}
        itemName={userToRemove?.username}
        type="user"
        loading={loading}
      />

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
          duration={5000}
          position="bottom-right"
        />
      )}
    </DetailsLayout>
  );
}
