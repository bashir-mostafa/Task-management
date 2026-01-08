// src/pages/home/tasks/services/ProjectTasksService.js
import api from "../../../../services/api";

class ProjectTasksService {
  
  /**
   * الحصول على مهام مشروع معين
   * @param {number} projectId - معرف المشروع
   * @param {Object} filters - فلتر البحث
   * @param {number} pageNumber - رقم الصفحة
   * @param {number} pageSize - حجم الصفحة
   * @returns {Promise} - وعد يحتوي على البيانات
   */
  static async getProjectTasks(projectId, filters = {}, pageNumber = 1, pageSize = 20) {
    try {
      const params = {
        priojectid: projectId,
        pageNumber,
        pageSize,
        ...filters
      };

      const response = await api.get('/Task', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      throw error;
    }
  }

  /**
   * الحصول على مهمة محددة
   * @param {number} taskId - معرف المهمة
   * @returns {Promise} - وعد يحتوي على بيانات المهمة
   */
  static async getTaskById(taskId) {
    try {
      const response = await api.get(`/Task/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  }

  /**
   * إنشاء مهمة جديدة لمشروع
   * @param {Object} taskData - بيانات المهمة
   * @returns {Promise} - وعد يحتوي على نتيجة الإنشاء
   */
  static async createTask(taskData) {
    try {
      const response = await api.post('/Task', taskData);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * تحديث مهمة موجودة
   * @param {number} taskId - معرف المهمة
   * @param {Object} taskData - بيانات التحديث
   * @returns {Promise} - وعد يحتوي على نتيجة التحديث
   */
  static async updateTask(taskId, taskData) {
    try {
      const response = await api.put(`/Task/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * حذف مهمة
   * @param {number} taskId - معرف المهمة
   * @returns {Promise} - وعد يحتوي على نتيجة الحذف
   */
  static async deleteTask(taskId) {
    try {
      const response = await api.delete(`/Task/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  /**
   * تغيير حالة المهمة
   * @param {number} taskId - معرف المهمة
   * @param {string} status - الحالة الجديدة
   * @returns {Promise} - وعد يحتوي على نتيجة التغيير
   */
  static async updateTaskStatus(taskId, status) {
    try {
      const response = await api.patch(`/Task/${taskId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }

  /**
   * تحديث تقييم المهمة
   * @param {number} taskId - معرف المهمة
   * @param {number} evaluation - التقييم
   * @param {string} notes - ملاحظات
   * @returns {Promise} - وعد يحتوي على نتيجة التحديث
   */
  static async updateTaskEvaluation(taskId, evaluation, notes = '') {
    try {
      const response = await api.patch(`/Task/${taskId}/evaluation`, { 
        evaluation_admin: evaluation, 
        notes_admin: notes 
      });
      return response.data;
    } catch (error) {
      console.error('Error updating task evaluation:', error);
      throw error;
    }
  }

  /**
   * الحصول على التصنيف حسب الحالة لمشروع معين
   * @param {number} projectId - معرف المشروع
   * @returns {Promise} - وعد يحتوي على التصنيف حسب الحالة
   */
  static async getProjectTasksStatusCount(projectId) {
    try {
      const data = await this.getProjectTasks(projectId, {}, 1, 0);
      return data.statusCount || [];
    } catch (error) {
      console.error('Error fetching status count:', error);
      return [];
    }
  }

  /**
   * الحصول على جميع المهام لمشروع معين بدون ترقيم صفحات
   * @param {number} projectId - معرف المشروع
   * @returns {Promise} - وعد يحتوي على جميع المهام
   */
  static async getAllProjectTasks(projectId) {
    try {
      const params = { priojectid: projectId };
      const response = await api.get('/Task', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching all project tasks:', error);
      throw error;
    }
  }

  /**
   * تصدير مهام المشروع
   * @param {number} projectId - معرف المشروع
   * @param {string} format - الصيغة (excel, pdf, csv)
   * @returns {Promise} - وعد يحتوي على بيانات التصدير
   */
  static async exportProjectTasks(projectId, format = 'excel') {
    try {
      const params = {
        priojectid: projectId,
        export: true,
        format: format
      };

      const response = await api.get('/Task/export', { 
        params,
        responseType: 'blob' // مهم لتحميل الملف
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting project tasks:', error);
      throw error;
    }
  }

  /**
   * إعادة تعيين رأس Authorization بعد تحديث التوكن
   */
  static updateAuthToken() {
    const token = localStorage.getItem("access");
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }
}

// تهيئة التوكن عند تحميل الملف
ProjectTasksService.updateAuthToken();

export default ProjectTasksService;