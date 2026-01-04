import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, UserPlus, Users, X, UserCheck } from "lucide-react";
import { taskService } from "../../services/taskService";
import { userTaskService } from "../../services/userTaskService";
import { userService } from "../../../users/services/userService";
import Button from "../../../../../components/UI/Button";
import Input from "../../../../../components/UI/InputField";
import Toast from "../../../../../components/Toast";
import LoadingSpinner from "../../../../../components/UI/LoadingSpinner";

export default function TaskAssignmentPage() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [task, setTask] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

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

        // جلب تفاصيل المهمة
        const taskData = await taskService.getTaskById(taskId);
        setTask(taskData);

        // جلب جميع المستخدمين
        const usersResponse = await userService.getUsers();
        const allUsersList = usersResponse.data || [];
        
        // تصفية المستخدمين غير المحذوفين فقط
        const activeUsers = allUsersList.filter(user => !user.isDeleted);
        setAllUsers(activeUsers);

        // جلب المستخدمين المعينين على المهمة
        try {
          const assignedUsersData = await userTaskService.getTaskDetails(taskId);
          setAssignedUsers(assignedUsersData.data || []);
        } catch (err) {
          console.warn("Could not fetch assigned users:", err);
          setAssignedUsers([]);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        showToast(error.response?.data?.message || t("fetchError"), "error");
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchData();
    }
  }, [taskId, t]);

  // تصفية المستخدمين المتاحين للتعيين (غير معينين)
  const filteredAvailableUsers = allUsers.filter(
    (user) =>
      !assignedUsers.some((assignedUser) => assignedUser.id === user.id) &&
      (user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // المستخدمين المعينين مع البحث
  const filteredAssignedUsers = assignedUsers.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssignUsers = async () => {
    const usersToAssign = selectedUsers.filter(id => 
      !assignedUsers.some(u => u.id === id)
    );

    if (usersToAssign.length === 0) {
      showToast(t("selectUsersFirst"), "error");
      return;
    }

    try {
      setSubmitting(true);

      // تعيين المستخدمين للمهمة
      await userTaskService.assignUsersToTask(taskId, usersToAssign);

      showToast(t("usersAssignedSuccessfully"), "success");
      
      // تحديث القوائم
      const updatedAssigned = await userTaskService.getTaskDetails(taskId);
      setAssignedUsers(updatedAssigned.data || []);
      
      // إعادة تعيين المستخدمين المحددين
      setSelectedUsers([]);
      setSearchTerm("");

    } catch (error) {
      console.error("Error assigning users to task:", error);
      showToast(error.response?.data?.message || t("assignUsersError"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveUsers = async () => {
    const usersToRemove = selectedUsers.filter(id => 
      assignedUsers.some(u => u.id === id)
    );

    if (usersToRemove.length === 0) {
      showToast(t("selectAssignedUsersFirst"), "error");
      return;
    }

    try {
      setSubmitting(true);

      // إزالة المستخدمين من المهمة
      await userTaskService.deleteUsersFromTask(taskId, usersToRemove);

      showToast(t("usersRemovedSuccessfully"), "success");
      
      // تحديث القوائم
      const updatedAssigned = await userTaskService.getTaskDetails(taskId);
      setAssignedUsers(updatedAssigned.data || []);
      
      // إعادة تعيين المستخدمين المحددين
      setSelectedUsers([]);
      setSearchTerm("");

    } catch (error) {
      console.error("Error removing users from task:", error);
      showToast(error.response?.data?.message || t("removeUsersError"), "error");
    } finally {
      setSubmitting(false);
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

  const getSelectedUsersDetails = () => {
    return allUsers.filter((user) => selectedUsers.includes(user.id));
  };

  const selectAllAvailable = () => {
    const allAvailableIds = filteredAvailableUsers.map(user => user.id);
    if (selectedUsers.length === allAvailableIds.length) {
      // إلغاء تحديد الكل
      setSelectedUsers(prev => prev.filter(id => !allAvailableIds.includes(id)));
    } else {
      // تحديد الكل
      setSelectedUsers(prev => [...new Set([...prev, ...allAvailableIds])]);
    }
  };

  const selectAllAssigned = () => {
    const allAssignedIds = assignedUsers.map(user => user.id);
    if (selectedUsers.length === allAssignedIds.length) {
      // إلغاء تحديد الكل
      setSelectedUsers(prev => prev.filter(id => !allAssignedIds.includes(id)));
    } else {
      // تحديد الكل
      setSelectedUsers(prev => [...new Set([...prev, ...allAssignedIds])]);
    }
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!task) {
    return (
      <div className="min-h-screen p-6 bg-background text-text">
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4" aria-hidden="true">
            ❌
          </div>
          <h2 className="text-2xl font-bold mb-4">
            {t("taskNotFound")}
          </h2>
          <Button 
            onClick={() => navigate(`/projects/${projectId}/tasks`)} 
            className="!w-auto px-6 py-3">
            {t("backToTasks")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 bg-background text-text">
      {/* Header */}
      <div className="mb-6">
        <div className={`flex items-center gap-3 mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
          <Button
            onClick={() => navigate(`/projects/${projectId}/tasks/${taskId}`)}
            variant="secondary"
            className={`flex items-center gap-2 !w-auto px-3 py-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            <ArrowLeft size={18} />
            <span>{t("backToTask")}</span>
          </Button>

          <div>
            <h1 className="text-xl md:text-2xl font-bold text-text">{t("assignUsersToTask")}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t("forTask")}: <strong className="text-text">{task.name}</strong>
            </p>
          </div>
        </div>

        {/* شريط البحث */}
        <div className="mb-4">
          <div className="max-w-md">
            <Input
              type="text"
              placeholder={t("searchUsers")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<UserCheck size={16} />}
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            />
          </div>
        </div>
      </div>

      {/* حاوية القوائم */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        {/* المستخدمون المعينون حالياً */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className={`flex items-center justify-between mb-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Users size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="font-semibold text-text">{t("assignedUsers")}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {filteredAssignedUsers.length} {t("of")} {assignedUsers.length}
                </p>
              </div>
            </div>
            {filteredAssignedUsers.length > 0 && (
              <button
                onClick={selectAllAssigned}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                {selectedUsers.filter(id => assignedUsers.some(u => u.id === id)).length === assignedUsers.length
                  ? t("deselectAll")
                  : t("selectAll")}
              </button>
            )}
          </div>

          {filteredAssignedUsers.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {filteredAssignedUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedUsers.includes(user.id)
                      ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700"
                      : "bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent"
                  }`}
                  onClick={() => handleUserSelect(user.id)}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      selectedUsers.includes(user.id)
                        ? "bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300"
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
                    className="w-4 h-4 text-red-600 dark:text-red-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-red-500"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <Users size={32} className="mx-auto mb-2 opacity-50" />
              <p>{searchTerm ? t("noUsersMatchSearch") : t("noUsersAssigned")}</p>
            </div>
          )}
        </div>

        {/* المستخدمون المتاحون */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className={`flex items-center justify-between mb-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30">
                <UserPlus size={18} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="font-semibold text-text">{t("availableUsers")}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {filteredAvailableUsers.length} {t("of")} {allUsers.length - assignedUsers.length}
                </p>
              </div>
            </div>
            {filteredAvailableUsers.length > 0 && (
              <button
                onClick={selectAllAvailable}
                className="text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300">
                {selectedUsers.filter(id => filteredAvailableUsers.some(u => u.id === id)).length === filteredAvailableUsers.length
                  ? t("deselectAll")
                  : t("selectAll")}
              </button>
            )}
          </div>

          {filteredAvailableUsers.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
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
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <UserPlus size={32} className="mx-auto mb-2 opacity-50" />
              <p>{searchTerm ? t("noUsersMatchSearch") : t("allUsersAssigned")}</p>
            </div>
          )}
        </div>
      </div>

      {/* المستخدمون المحددون */}
      {selectedUsers.length > 0 && (
        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <div className={`flex items-center justify-between mb-3 ${isRTL ? "flex-row-reverse" : ""}`}>
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
              const isAssigned = assignedUsers.some(u => u.id === user.id);
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
          <div className={`flex flex-wrap gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Button
              onClick={handleAssignUsers}
              disabled={submitting || !selectedUsers.some(id => 
                !assignedUsers.some(u => u.id === id)
              )}
              className="flex items-center gap-2 min-w-[120px] justify-center">
              {submitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <UserPlus size={16} />
              )}
              <span>{t("assignSelected")}</span>
            </Button>

            <Button
              onClick={handleRemoveUsers}
              variant="danger"
              disabled={submitting || !selectedUsers.some(id => 
                assignedUsers.some(u => u.id === id)
              )}
              className="flex items-center gap-2 min-w-[120px] justify-center">
              {submitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <X size={16} />
              )}
              <span>{t("removeSelected")}</span>
            </Button>
          </div>
        </div>
      )}

 

      {/* Toast */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
          duration={3000}
        />
      )}
    </div>
  );
}