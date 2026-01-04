// src/services/supTaskService.js
import api from "../../../../services/api";

export const supTaskService = {
  // الحصول على جميع المهام الفرعية لمهمة معينة
  getSupTasksByTask: async (taskId, params = {}) => {
    try {
      const response = await api.get('/SupTask', {
        params: {
          Ttaskid: taskId,
          pageNumber: params.pageNumber || 1,
          pageSize: params.pageSize || 20,
          Name: params.Name || '',
          ...params
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching sup tasks:', error);
      throw error;
    }
  },

  // الحصول على مهمة فرعية بواسطة ID
  getSupTaskById: async (supTaskId) => {
    try {
      const response = await api.get(`/SupTask/${supTaskId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sup task ${supTaskId}:`, error);
      throw error;
    }
  },

  // إنشاء مهمة فرعية جديدة
  createSupTask: async (supTaskData) => {
    console.log('🔄 Creating sup task with data:', supTaskData);
    
    const requestData = {
      name: supTaskData.name,
      description: supTaskData.description,
      start_date: supTaskData.start_date,
      end_date: supTaskData.end_date,
      taskid: supTaskData.taskid,
      user_id: supTaskData.user_id || 0
    };

    console.log('📤 Sending request data:', requestData);

    try {
      const response = await api.post('/SupTask', requestData);
      console.log('✅ Sup task created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating sup task:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        requestData: requestData
      });
      throw error;
    }
  },

  // تحديث مهمة فرعية
  updateSupTask: async (supTaskId, supTaskData) => {
    console.log('🔄 Updating sup task with data:', { supTaskId, supTaskData });
    
    const requestData = {
      name: supTaskData.name,
      description: supTaskData.description,
      start_date: supTaskData.start_date,
      end_date: supTaskData.end_date,
      user_id: supTaskData.user_id || 0,
      completed: supTaskData.completed || false,
      user_notes: supTaskData.user_notes || ""
    };

    console.log('📤 Sending update request data:', requestData);

    try {
      const response = await api.put(`/SupTask/${supTaskId}`, requestData);
      console.log('✅ Sup task updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating sup task:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        requestData: requestData
      });
      throw error;
    }
  },

  // حذف مهمة فرعية
  deleteSupTask: async (supTaskId) => {
    try {
      const response = await api.delete(`/SupTask/${supTaskId}`);
      console.log('✅ Sup task deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting sup task ${supTaskId}:`, error);
      throw error;
    }
  },

  // تحديث حالة المهمة الفرعية
  updateSupTaskStatus: async (supTaskId, status) => {
    try {
      const requestData = {
        completed: status === 2, // 2 تعني completed
        status: status
      };
      const response = await api.put(`/SupTask/${supTaskId}`, requestData);
      return response.data;
    } catch (error) {
      console.error(`Error updating sup task status ${supTaskId}:`, error);
      throw error;
    }
  },

  // إضافة ملاحظات للمستخدم
  addUserNotes: async (supTaskId, notes) => {
    try {
      const requestData = {
        user_notes: notes
      };
      const response = await api.put(`/SupTask/${supTaskId}`, requestData);
      return response.data;
    } catch (error) {
      console.error(`Error adding notes to sup task ${supTaskId}:`, error);
      throw error;
    }
  }
};

export default supTaskService;