// src/pages/admin/dashboard/services/StatisticsServices.js
import api from "../../../../services/api";

export const StatisticsServices = {
  /**
   * الحصول على جميع الإحصائيات
   * @returns {Promise} - بيانات الإحصائيات
   */
  async getStatistics() {
    try {
      const response = await api.get('Statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  },

  /**
   * الحصول على إحصائيات المشاريع
   * @returns {Promise} - إحصائيات المشاريع
   */
  async getProjectStatistics() {
    const stats = await this.getStatistics();
    return stats?.projectData || {};
  },

  /**
   * الحصول على إحصائيات المهام
   * @returns {Promise} - إحصائيات المهام
   */
  async getTaskStatistics() {
    const stats = await this.getStatistics();
    return stats?.taskData || {};
  },

  /**
   * الحصول على إحصائيات المهام الفرعية
   * @returns {Promise} - إحصائيات المهام الفرعية
   */
  async getSupTaskStatistics() {
    const stats = await this.getStatistics();
    return stats?.supTaskData || {};
  },

  /**
   * الحصول على إحصائيات موجزة
   * @returns {Promise} - إحصائيات موجزة
   */
  async getSummaryStatistics() {
    const stats = await this.getStatistics();
    
    return {
      totalProjects: stats?.projectData?.totalCount || 0,
      totalTasks: stats?.taskData?.totalCount || 0,
      totalSupTasks: stats?.supTaskData?.totalCount || 0,
      
      // المشاريع
      projects: {
        planning: stats?.projectData?.statusCounts?.find(item => item.status === 'planning')?.count || 0,
        underimplementation: stats?.projectData?.statusCounts?.find(item => item.status === 'Underimplementation')?.count || 0,
        pause: stats?.projectData?.statusCounts?.find(item => item.status === 'Pause')?.count || 0,
        notimplemented: stats?.projectData?.statusCounts?.find(item => item.status === 'Notimplemented')?.count || 0,
      },
      
      // المهام
      tasks: {
        underimplementation: stats?.taskData?.statusCounts?.find(item => item.status === 'Underimplementation')?.count || 0,
        complete: stats?.taskData?.statusCounts?.find(item => item.status === 'Complete')?.count || 0,
        notimplemented: stats?.taskData?.statusCounts?.find(item => item.status === 'Notimplemented')?.count || 0,
        pause: stats?.taskData?.statusCounts?.find(item => item.status === 'Pause')?.count || 0,
      },
      
      // المهام الفرعية
      supTasks: {
        underimplementation: stats?.supTaskData?.statusCounts?.find(item => item.status === 'Underimplementation')?.count || 0,
        complete: stats?.supTaskData?.statusCounts?.find(item => item.status === 'Complete')?.count || 0,
      }
    };
  }
};

export default StatisticsServices;