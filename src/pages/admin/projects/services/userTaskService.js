// src/services/userTaskService.js
import api from "../../../../services/api";

export const userTaskService = {
  // تعيين مستخدمين للمهمة
  assignUsersToTask: async (taskId, usersIds) => {
    const response = await api.post("/UserTask/AssignUsers", {
      task_id: taskId,
      users_id: usersIds
    });
    return response.data;
  },

  // تحديث مستخدمي المهمة
  updateTaskUsers: async (taskId, usersIds) => {
    const response = await api.put("/UserTask/UpdateTaskUsers", {
      task_id: taskId,
      users_id: usersIds
    });
    return response.data;
  },

  // الحصول على تفاصيل المهمة مع المستخدمين
  getTaskDetails: async (taskId) => {
    const response = await api.get(`/UserTask/${taskId}`);
    return response.data;
  },

  // إزالة مستخدم من المهمة
  removeUserFromTask: async (taskId, userId) => {
    const response = await api.delete(`/UserTask/${taskId}/user/${userId}`);
    return response.data;
  }
};

export default userTaskService;