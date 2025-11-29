// src/pages/admin/projects/pages/ProjectUsersManagementPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  ArrowLeft, 
  Save, 
  UserPlus, 
  Users, 
  X, 
  Trash2, 
  UserMinus,
  Search 
} from "lucide-react";
import { userProjectService } from "../../services/userProjectService";
import { projectService } from "../../services/projectService";
import useDarkMode from "../../../../../hooks/useDarkMode";
import Button from "../../../../../components/UI/Button";
import Modal from "../../../../../components/UI/Modal";
import DeleteConfirmationModal from "../../../../../components/UI/DeleteConfirmationModal";

export default function ProjectUsersManagementPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isDark } = useDarkMode();

  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [currentProjectUsers, setCurrentProjectUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userToRemove, setUserToRemove] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addUsersModalOpen, setAddUsersModalOpen] = useState(false);

  const isRTL = i18n.language === "ar";

  // جلب البيانات
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // جلب تفاصيل المشروع
      const projectResult = await projectService.getProjectById(projectId);
      if (projectResult.project) {
        setProject(projectResult.project);
        setCurrentProjectUsers(projectResult.project.users || []);
      }

      // جلب جميع المستخدمين المتاحين
      const usersResponse = await userProjectService.getAllUsers();
      setAvailableUsers(usersResponse.users || usersResponse.data || usersResponse || []);

    } catch (error) {
      console.error("Error fetching data:", error);
      alert(t("fetchError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId, t]);

  // إزالة مستخدم من المشروع
  const handleRemoveUser = async (userId) => {
    try {
      setLoading(true);
      await userProjectService.removeUserFromProject(projectId, userId);
      
      // تحديث القائمة محلياً
      setCurrentProjectUsers(prev => prev.filter(user => user.id !== userId));
      setDeleteModalOpen(false);
      setUserToRemove(null);
      
      alert(t("userRemovedSuccessfully"));
    } catch (error) {
      console.error("Error removing user from project:", error);
      alert(t("removeUserError"));
    } finally {
      setLoading(false);
    }
  };

  // إضافة مستخدمين إلى المشروع
  const handleAddUsers = async () => {
    if (selectedUsers.length === 0) {
      alert(t("selectUsersFirst"));
      return;
    }

    try {
      setLoading(true);
      await userProjectService.addUsersToProject(projectId, selectedUsers);
      
      // إعادة جلب البيانات لتحديث القائمة
      await fetchData();
      setSelectedUsers([]);
      setAddUsersModalOpen(false);
      
      alert(t("usersAddedSuccessfully"));
    } catch (error) {
      console.error("Error adding users to project:", error);
      alert(t("addUsersError"));
    } finally {
      setLoading(false);
    }
  };

  // تصفية المستخدمين المتاحين
  const filteredAvailableUsers = availableUsers.filter(user => 
    !currentProjectUsers.some(projectUser => projectUser.id === user.id) &&
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const removeSelectedUser = (userId) => {
    setSelectedUsers(prev => prev.filter(id => id !== userId));
  };

  const getSelectedUsersDetails = () => {
    return availableUsers.filter(user => selectedUsers.includes(user.id));
  };

  const openRemoveConfirmation = (user) => {
    setUserToRemove(user);
    setDeleteModalOpen(true);
  };

  if (loading && !project) {
    return (
      <div className="min-h-screen p-6 bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-background text-text">
      {/* Header */}
      <div className={`flex items-center justify-between mb-6 ${isRTL ? "flex-row-reverse" : ""}`}>
        <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
          <Button
            onClick={() => navigate(`/dashboard/projects/${projectId}`)}
            variant="secondary"
            className={`flex items-center gap-2 !w-auto px-4 py-2 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <ArrowLeft size={20} />
            <span>{t("backToProject")}</span>
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t("manageProjectUsers")}
            </h1>
            {project && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t("forProject")}: <strong>{project.name}</strong>
              </p>
            )}
          </div>
        </div>

        <Button
          onClick={() => setAddUsersModalOpen(true)}
          className={`flex items-center gap-2 !w-auto px-4 py-2 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <UserPlus size={20} />
          <span>{t("addUsers")}</span>
        </Button>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* إحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {currentProjectUsers.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t("totalUsers")}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {currentProjectUsers.filter(user => user.role === 1).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t("admins")}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {currentProjectUsers.filter(user => user.role === 2).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t("regularUsers")}
            </div>
          </div>
        </div>

        {/* قائمة المستخدمين الحاليين */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className={`flex items-center justify-between mb-6 ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Users size={24} className="text-blue-600" />
              <h2 className="text-xl font-semibold">{t("currentProjectUsers")}</h2>
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-3 py-1 rounded-full text-sm">
                {currentProjectUsers.length}
              </span>
            </div>
          </div>

          {currentProjectUsers.length > 0 ? (
            <div className="grid gap-4">
              {currentProjectUsers.map(user => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-lg">{user.username}</p>
                      <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                      <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                        user.role === 1 
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      }`}>
                        {user.role === 1 ? t("admin") : t("user")}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="danger"
                    onClick={() => openRemoveConfirmation(user)}
                    className="flex items-center gap-2 !w-auto px-3 py-2"
                    disabled={loading}
                  >
                    <UserMinus size={16} />
                    <span>{t("remove")}</span>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Users size={64} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">{t("noUsersInProject")}</p>
              <p className="text-sm">{t("addUsersToGetStarted")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal إضافة مستخدمين */}
      <Modal
        isOpen={addUsersModalOpen}
        onClose={() => {
          setAddUsersModalOpen(false);
          setSelectedUsers([]);
          setSearchTerm("");
        }}
        title={t("addUsersToProject")}
        size="lg"
      >
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
                {getSelectedUsersDetails().map(user => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-3 py-2 rounded-full"
                  >
                    <span>{user.username}</span>
                    <button
                      type="button"
                      onClick={() => removeSelectedUser(user.id)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                    >
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
              filteredAvailableUsers.map(user => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-600 last:border-b-0 cursor-pointer transition-colors ${
                    selectedUsers.includes(user.id)
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => handleUserSelect(user.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
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

          {/* أزرار الإجراء */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setAddUsersModalOpen(false);
                setSelectedUsers([]);
                setSearchTerm("");
              }}
              disabled={loading}
              className="flex-1"
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleAddUsers}
              disabled={loading || selectedUsers.length === 0}
              className="flex-1 flex items-center gap-2 justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <UserPlus size={16} />
              )}
              <span>
                {selectedUsers.length > 0 
                  ? t("addUsersCount", { count: selectedUsers.length })
                  : t("addUsers")
                }
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
    </div>
  );
}