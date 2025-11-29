// src/pages/admin/projects/pages/AddUsersToProjectPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Save, UserPlus, Users, X } from "lucide-react";
import { userProjectService } from "../../services/userProjectService";
import { projectService } from "../../services/projectService";
import useDarkMode from "../../../../../hooks/useDarkMode";

export default function AddUsersToProjectPage() {
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

  const isRTL = i18n.language === "ar";

  useEffect(() => {
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
        // ملاحظة: ستحتاج لإنشاء خدمة لجلب جميع المستخدمين
        // افترضنا أن لديك endpoint /User
        const usersResponse = await userProjectService.getAllUsers();
        setAvailableUsers(usersResponse.data || usersResponse);

      } catch (error) {
        console.error("Error fetching data:", error);
        alert(t("fetchError"));
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId, t]);

  // تصفية المستخدمين المتاحين (استبعاد المستخدمين الموجودين بالفعل في المشروع)
  const filteredAvailableUsers = availableUsers.filter(user => 
    !currentProjectUsers.some(projectUser => projectUser.id === user.id) &&
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUsers = async () => {
    if (selectedUsers.length === 0) {
      alert(t("selectUsersFirst"));
      return;
    }

    try {
      setLoading(true);
      await userProjectService.addUsersToProject(projectId, selectedUsers);
      
      alert(t("usersAddedSuccessfully"));
      navigate(`/dashboard/projects/${projectId}`);
    } catch (error) {
      console.error("Error adding users to project:", error);
      alert(t("addUsersError"));
    } finally {
      setLoading(false);
    }
  };

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

  if (loading && !project) {
    return (
      <div className="min-h-screen p-6 bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Header */}
      <div className={`flex items-center justify-between mb-6 ${isRTL ? "flex-row-reverse" : ""}`}>
        <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
          <button
            onClick={() => navigate(`/dashboard/projects/${projectId}`)}
            className={`flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <ArrowLeft size={20} />
            <span>{t("backToProject")}</span>
          </button>
          
          <div>
            <h1 className="text-3xl font-bold">{t("addUsersToProject")}</h1>
            {project && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t("forProject")}: <strong>{project.name}</strong>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* المستخدمون الحاليون في المشروع */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className={`flex items-center gap-2 mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Users size={20} className="text-blue-600" />
              <h2 className="text-xl font-semibold">{t("currentProjectUsers")}</h2>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                {currentProjectUsers.length}
              </span>
            </div>

            {currentProjectUsers.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {currentProjectUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        user.role === 1 
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      }`}>
                        {user.role === 1 ? t("admin") : t("user")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>{t("noUsersInProject")}</p>
              </div>
            )}
          </div>

          {/* إضافة مستخدمين جدد */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className={`flex items-center gap-2 mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
              <UserPlus size={20} className="text-green-600" />
              <h2 className="text-xl font-semibold">{t("addNewUsers")}</h2>
            </div>

            {/* شريط البحث */}
            <div className="mb-4">
              <input
                type="text"
                placeholder={t("searchUsers")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* قائمة المستخدمين المتاحين */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">{t("availableUsers")}</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredAvailableUsers.length > 0 ? (
                  filteredAvailableUsers.map(user => (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedUsers.includes(user.id)
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => handleUserSelect(user.id)}
                    >
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                      
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    <p>{t("noUsersFound")}</p>
                  </div>
                )}
              </div>
            </div>

            {/* المستخدمون المحددون */}
            {selectedUsers.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">
                  {t("selectedUsers")} ({selectedUsers.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {getSelectedUsersDetails().map(user => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-2 rounded-full"
                    >
                      <span>{user.username}</span>
                      <button
                        type="button"
                        onClick={() => removeSelectedUser(user.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* زر الإضافة */}
            <button
              onClick={handleAddUsers}
              disabled={loading || selectedUsers.length === 0}
              className={`flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <UserPlus size={20} />
              )}
              <span>
                {selectedUsers.length > 0 
                  ? t("addUsersCount", { count: selectedUsers.length })
                  : t("addUsersToProject")
                }
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}