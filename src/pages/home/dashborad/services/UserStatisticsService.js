// src/pages/admin/dashboard/services/UserStatisticsService.js
import api from "../../../../services/api";

const UserStatisticsService = {
  /**
   * الحصول على إحصائيات المستخدم
   * @returns {Promise} - إحصائيات المستخدم
   */
  async getUserStatistics() {
    try {
      const response = await api.get('Users/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      throw error;
    }
  },

  /**
   * الحصول على إحصائيات المشاريع للمستخدم
   * @returns {Promise} - إحصائيات المشاريع
   */
  async getUserProjectStatistics() {
    const stats = await this.getUserStatistics();
    return stats?.projects || {};
  },

  /**
   * الحصول على إحصائيات المهام للمستخدم
   * @returns {Promise} - إحصائيات المهام
   */
  async getUserTaskStatistics() {
    const stats = await this.getUserStatistics();
    return stats?.tasks || {};
  },

  /**
   * الحصول على إحصائيات المهام الفرعية للمستخدم
   * @returns {Promise} - إحصائيات المهام الفرعية
   */
  async getUserSupTaskStatistics() {
    const stats = await this.getUserStatistics();
    return stats?.supTasks || {};
  }
};

export default UserStatisticsService;