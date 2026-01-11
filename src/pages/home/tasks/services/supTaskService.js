// src/admin/projects/services/supTaskService.js
import api from "../../../../services/api";

export const supTaskService = {
  /**
   * الحصول على جميع المهام الفرعية (Sub Tasks) لمهمة رئيسية
   */
  getAllSupTasks: async (params = {}) => {
    const response = await api.get('SupTask', {
      params: {
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 20,
        ...params
      }
    });
    return response.data;
  },

  /**
   * تحديث المهمة الفرعية
   * يمكن تحديث الحالة (status) والملاحظات (user_notes)
   */
  updateSupTask: async (supTaskId, supTaskData) => {
    const response = await api.put(`SupTask/${supTaskId}`, supTaskData);
    return response.data;
  },

  /**
   * تحديث ملاحظات المستخدم فقط للمهمة الفرعية
   */
  updateSupTaskUserNotes: async (supTaskId, userNotes) => {
    const response = await api.put(`SupTask/${supTaskId}`, {
      user_notes: userNotes
    });
    return response.data;
  },

  /**
   * تحديث حالة المهمة الفرعية
   */
  updateSupTaskStatus: async (supTaskId, status) => {
    const response = await api.put(`SupTask/${supTaskId}`, {
      status: status
    });
    return response.data;
  },

  /**
   * تحديث المهمة الفرعية كمكتملة مع ملاحظات
   */
  completeSupTask: async (supTaskId, userNotes = "") => {
    const response = await api.put(`SupTask/${supTaskId}`, {
      status: "Complete",
      user_notes: userNotes
    });
    return response.data;
  }
};