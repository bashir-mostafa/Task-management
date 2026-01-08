// src/services/dashboardService.js
import api from '../../../../services/api';

export const dashboardService = {
  // الحصول على إحصائيات المستخدمين
  getUserStatistics: async () => {
    try {
      const response = await api.get('Users/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      // إرجاع بيانات افتراضية في حالة الخطأ
      return {
        totalUsers: 0,
        activeUsers: 0,
        newUsersThisMonth: 0,
        usersByRole: {}
      };
    }
  },

  // الحصول على إحصائيات المشاريع (إذا كان API متاحاً)
  getProjectStatistics: async () => {
    try {
      const response = await api.get('Project');
      const projects = response.data.projects || response.data || [];
      
      // حساب الإحصائيات يدوياً
      const totalProjects = projects.length;
      const activeProjects = projects.filter(p => 
        p.status === 'active' || p.status === 'Underimplementation'
      ).length;
      const completedProjects = projects.filter(p => 
        p.status === 'Complete' || p.status === 'completed'
      ).length;
      
      return {
        totalProjects,
        activeProjects,
        completedProjects,
        projectsByStatus: {
          planning: projects.filter(p => p.status === 'planning').length,
          Underimplementation: projects.filter(p => p.status === 'Underimplementation').length,
          Complete: projects.filter(p => p.status === 'Complete').length,
          Pause: projects.filter(p => p.status === 'Pause').length,
          Notimplemented: projects.filter(p => p.status === 'Notimplemented').length
        }
      };
    } catch (error) {
      console.error('Error fetching project statistics:', error);
      return {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        projectsByStatus: {}
      };
    }
  },

  // الحصول على إحصائيات التاسكات (إذا كان API متاحاً)
  getTaskStatistics: async () => {
    try {
      const response = await api.get('/api/Task');
      const tasks = response.data.tasks || response.data || [];
      
      // حساب الإحصائيات يدوياً
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => 
        t.status === 'Complete' || t.status === 'completed'
      ).length;
      const inProgressTasks = tasks.filter(t => 
        t.status === 'Underimplementation' || t.status === 'inProgress'
      ).length;
      
      // حساب متوسط معدل النجاح
      const tasksWithSuccessRate = tasks.filter(t => t.success_rate);
      const averageSuccessRate = tasksWithSuccessRate.length > 0 
        ? tasksWithSuccessRate.reduce((sum, t) => sum + (t.success_rate || 0), 0) / tasksWithSuccessRate.length
        : 0;
      
      return {
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks: tasks.filter(t => t.status === 'Notimplemented' || t.status === 'planning').length,
        averageSuccessRate: Math.round(averageSuccessRate),
        tasksByStatus: {
          Notimplemented: tasks.filter(t => t.status === 'Notimplemented').length,
          Underimplementation: tasks.filter(t => t.status === 'Underimplementation').length,
          Complete: tasks.filter(t => t.status === 'Complete').length,
          Pause: tasks.filter(t => t.status === 'Pause').length,
          planning: tasks.filter(t => t.status === 'planning').length
        }
      };
    } catch (error) {
      console.error('Error fetching task statistics:', error);
      return {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        pendingTasks: 0,
        averageSuccessRate: 0,
        tasksByStatus: {}
      };
    }
  },

  // الحصول على جميع الإحصائيات
  getDashboardStatistics: async () => {
    try {
      const [usersStats, projectsStats, tasksStats] = await Promise.all([
        dashboardService.getUserStatistics(),
        dashboardService.getProjectStatistics(),
        dashboardService.getTaskStatistics()
      ]);
      
      return {
        users: usersStats,
        projects: projectsStats,
        tasks: tasksStats,
        overall: {
          totalUsers: usersStats.totalUsers || 0,
          totalProjects: projectsStats.totalProjects || 0,
          totalTasks: tasksStats.totalTasks || 0,
          completionRate: projectsStats.totalProjects > 0 
            ? Math.round((projectsStats.completedProjects / projectsStats.totalProjects) * 100)
            : 0
        },
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      throw error;
    }
  }
};

export default dashboardService;