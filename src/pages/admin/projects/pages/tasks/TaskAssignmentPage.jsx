// src/pages/admin/projects/pages/TaskAssignmentPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Save, UserPlus, Users, X } from "lucide-react";
import { taskService } from "../../services/taskService";
import { userProjectService } from "../../services/userProjectService";
import useDarkMode from "../../../../../hooks/useDarkMode";
import Button from "../../../../../components/UI/Button";
import Modal from "../../../../../components/UI/Modal";

export default function TaskAssignmentPage() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isDark } = useDarkMode();

  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState(null);
  const [projectUsers, setProjectUsers] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const isRTL = i18n.language === "ar";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // جلب تفاصيل المهمة
        const taskData = await taskService.getTaskById(taskId);
        console.log("Fetched task data:", taskData);
        setTask(taskData);

        // جلب مستخدمي المشروع
        const projectData = await userProjectService.getProjectDetails(
          projectId
        );
        setProjectUsers(projectData.users || []);

        // جلب المستخدمين المعينين على المهمة
        setAssignedUsers(taskData.users || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert(t("fetchError"));
      } finally {
        setLoading(false);
      }
    };

    if (projectId && taskId) {
      fetchData();
    }
  }, [projectId, taskId, t]);

  // تصفية المستخدمين المتاحين للتعيين
  const filteredAvailableUsers = projectUsers.filter(
    (user) =>
      !assignedUsers.some((assignedUser) => assignedUser.id === user.id) &&
      user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssignUsers = async () => {
    if (selectedUsers.length === 0) {
      alert(t("selectUsersFirst"));
      return;
    }

    try {
      setLoading(true);

      // تعيين المستخدمين للمهمة
      for (const userId of selectedUsers) {
        await taskService.assignUserToTask(taskId, userId);
      }

      alert(t("usersAssignedSuccessfully"));
      navigate(`/dashboard/projects/${projectId}/tasks`);
    } catch (error) {
      console.error("Error assigning users to task:", error);
      alert(t("assignUsersError"));
    } finally {
      setLoading(false);
    }
  };

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
    return projectUsers.filter((user) => selectedUsers.includes(user.id));
  };

  if (loading && !task) {
    return (
      <div className="min-h-screen p-6 bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-background text-text">
      {/* Header */}
      <div
        className={`flex items-center justify-between mb-6 ${
          isRTL ? "flex-row-reverse" : ""
        }`}>
        <div
          className={`flex items-center gap-4 ${
            isRTL ? "flex-row-reverse" : ""
          }`}>
          <Button
            onClick={() => navigate(`/dashboard/projects/${projectId}/tasks`)}
            variant="secondary"
            className={`flex items-center gap-2 !w-auto px-4 py-2 ${
              isRTL ? "flex-row-reverse" : ""
            }`}>
            <ArrowLeft size={20} />
            <span>{t("backToTasks")}</span>
          </Button>

          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t("assignUsersToTask")}
            </h1>
            {task && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t("forTask")}: <strong>{task.name}</strong>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* المستخدمون المعينون حالياً */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div
              className={`flex items-center gap-2 mb-4 ${
                isRTL ? "flex-row-reverse" : ""
              }`}>
              <Users size={20} className="text-blue-600" />
              <h2 className="text-xl font-semibold">
                {t("currentlyAssignedUsers")}
              </h2>
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full text-sm">
                {assignedUsers.length}
              </span>
            </div>

            {assignedUsers.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {assignedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>{t("noUsersAssigned")}</p>
              </div>
            )}
          </div>

          {/* تعيين مستخدمين جدد */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div
              className={`flex items-center gap-2 mb-4 ${
                isRTL ? "flex-row-reverse" : ""
              }`}>
              <UserPlus size={20} className="text-green-600" />
              <h2 className="text-xl font-semibold">{t("assignNewUsers")}</h2>
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
              <h3 className="text-lg font-medium mb-3">
                {t("availableUsers")}
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredAvailableUsers.length > 0 ? (
                  filteredAvailableUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedUsers.includes(user.id)
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => handleUserSelect(user.id)}>
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleUserSelect(user.id)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    <p>{t("noUsersAvailable")}</p>
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
                  {getSelectedUsersDetails().map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-2 rounded-full">
                      <span>{user.username}</span>
                      <button
                        type="button"
                        onClick={() => removeSelectedUser(user.id)}
                        className="text-blue-600 hover:text-blue-800">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* زر التعيين */}
            <Button
              onClick={handleAssignUsers}
              disabled={loading || selectedUsers.length === 0}
              className={`flex items-center gap-2 w-full justify-center ${
                isRTL ? "flex-row-reverse" : ""
              }`}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <UserPlus size={20} />
              )}
              <span>
                {selectedUsers.length > 0
                  ? t("assignUsersCount", { count: selectedUsers.length })
                  : t("assignUsers")}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
