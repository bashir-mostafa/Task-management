// src/services/userProjectService.js
import api from "../../../../services/api";

export const userProjectService = {
  // إضافة مستخدمين إلى المشروع
  addUsersToProject: async (projectId, usersIds) => {
    const response = await api.post("/UserProject", {
      project_id: parseInt(projectId),
      users_ids: usersIds
    });
    return response.data;
  },

  // إزالة مستخدمين من المشروع
  removeUsersFromProject: async (projectId, usersIds) => {
    const response = await api.delete("/UserProject", {
      data: {
        project_id: parseInt(projectId),
        users_ids: usersIds
      }
    });
    return response.data;
  },

  // إزالة مستخدم واحد من المشروع
  removeUserFromProject: async (projectId, userId) => {
    const response = await api.delete(`/UserProject/${projectId}/user/${userId}`);
    return response.data;
  },

  // الحصول على تفاصيل المشروع مع المستخدمين
  getProjectDetails: async (projectId) => {
    const response = await api.get(`/UserProject/${projectId}`);
    return response.data;
  },

  // الحصول على جميع المستخدمين المتاحين
  getAllUsers: async () => {
    try {
      const response = await api.get("/Users");
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      // إذا كان endpoint المستخدمين مختلف، جرب هذا
      const response = await api.get("/User");
      return response.data;
    }
  }
};

export default userProjectService;