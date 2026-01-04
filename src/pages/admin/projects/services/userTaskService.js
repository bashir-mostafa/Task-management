// src/services/userTaskService.js
import api from "../../../../services/api";

export const userTaskService = {
  // تعيين مستخدمين للمهمة
  assignUsersToTask: async (taskId, usersIds) => {
    const response = await api.post("/UserTask/AssignUsersToTask", {
      task_id: taskId,
      users_id: usersIds
    });
    return response.data;
  },

  // حذف مستخدمين من المهمة
  deleteUsersFromTask: async (taskId, usersIds) => {
    const response = await api.delete("/UserTask/DeleteUsersInTask", {
      data: {
        task_id: taskId,
        users_id: usersIds
      }
    });
    return response.data;
  },

  // الحصول على تفاصيل المهمة مع المستخدمين
  getTaskDetails: async (taskId, params = {}) => {
    const response = await api.get(`/UserTask/${taskId}`, {
      params: {
        PageNumber: params.PageNumber || 1,
        PageSize: params.PageSize || 20,
        ...params
      }
    });
    return response.data;
  }
};

export default userTaskService;