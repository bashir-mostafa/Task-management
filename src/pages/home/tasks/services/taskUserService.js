// src/admin/projects/services/taskUserService.js
import api from "../../../../services/api";

export const taskUserService = {
  // الحصول على جميع المهام الخاصة بالمستخدم الحالي
  getAllTasks: async (params = {}) => {
    const response = await api.get('Task/TaskUser', {
      params: {
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 20,
        ...params
      }
    });
    return response.data;
  },

  // الحصول على مهمة محددة للمستخدم
  getTaskById: async (taskId) => {
    const response = await api.get(`Task/${taskId}`);
    return response.data;
  },

  // تحديث حالة المهمة
  updateTaskStatus: async (taskId, status) => {
    const response = await api.put(`Task/TaskUser/${taskId}/status`, { status });
    return response.data;
  },

  // تحديث تقدم المهمة
  updateProgress: async (taskId, progress, notes) => {
    const response = await api.put(`Task/TaskUser/${taskId}/progress`, {
      progress,
      notes
    });
    return response.data;
  },

  // إضافة تعليق للمهمة
  addComment: async (taskId, comment) => {
    const response = await api.post(`Task/TaskUser/${taskId}/comments`, { comment });
    return response.data;
  },

  // الحصول على تعليقات المهمة
  getComments: async (taskId) => {
    const response = await api.get(`Task/TaskUser/${taskId}/comments`);
    return response.data;
  },

  // تحميل ملف للمهمة
  uploadFile: async (taskId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`Task/TaskUser/${taskId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  },

  // الحصول على ملفات المهمة
  getFiles: async (taskId) => {
    const response = await api.get(`Task/TaskUser/${taskId}/files`);
    return response.data;
  }
};