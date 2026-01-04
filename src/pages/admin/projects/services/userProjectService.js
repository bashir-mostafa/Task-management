// src/services/userProjectService.js
import api from "../../../../services/api";

export const userProjectService = {
  // الحصول على مستخدمي المشروع
  getProjectUsers: async (projectId, params = {}) => {
    const response = await api.get(`/UserProject/${projectId}`, {
      params: {
        PageNumber: params.pageNumber || 1,
        PageSize: params.pageSize || 20,
        ...params
      }
    });
    return response.data;
  },

  // إضافة مستخدمين إلى المشروع
  addUsersToProject: async (projectId, usersIds) => {
    const response = await api.post("/UserProject/AssignUsersToProject", {
      project_id: parseInt(projectId),
      users_id: usersIds
    });
    return response.data;
  },

  // إزالة مستخدمين من المشروع
  removeUsersFromProject: async (projectId, usersIds) => {
    const response = await api.delete("/UserProject", {
      data: {
        project_id: parseInt(projectId),
        users_id: usersIds
      }
    });
    return response.data;
  },

  // الحصول على جميع المستخدمين (للتحديد)
  getAllUsers: async () => {
    try {
      // جرب endpoint للمستخدمين
      const response = await api.get("/Users");
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      // جرب endpoint بديل إذا كان مختلف
      try {
        const response = await api.get("/User");
        return response.data;
      } catch (secondError) {
        console.error("Error fetching from /User:", secondError);
        return { users: [], data: [] };
      }
    }
  },

  // إزالة مستخدم واحد من المشروع
  removeUserFromProject: async (projectId, userId) => {
    const response = await api.delete("/UserProject", {
      data: {
        project_id: parseInt(projectId),
        users_id: [parseInt(userId)]
      }
    });
    return response.data;
  }
};

export default userProjectService;