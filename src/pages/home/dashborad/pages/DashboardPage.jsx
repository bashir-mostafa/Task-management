// src/pages/admin/dashboard/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Briefcase,
  ListTodo,
  Layers,
  CheckCircle,
  Clock,
  AlertCircle,
  PauseCircle,
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  Target,
  Users
} from 'lucide-react';
import UserStatisticsService from '../services/UserStatisticsService';
import StatCard from '../../../../components/UI/StatCard';
import Card, { CardGrid, CardStats } from '../../../../components/UI/Card';
import ProgressBar from '../../../../components/UI/ProgressBar';

export default function DashboardPage() {
  const { t } = useTranslation();
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserStatistics();
  }, []);

  const fetchUserStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await UserStatisticsService.getUserStatistics();
      console.log('User statistics:', data);
      setUserStats(data);
      
    } catch (err) {
      setError(t('fetchError'));
      console.error('Error fetching user statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  // حساب النسب المئوية
  const calculateCompletionRates = (stats) => {
    if (!stats) return {};

    const projectCompletionRate = stats.projects?.total > 0 
      ? Math.round((stats.projects.completed / stats.projects.total) * 100)
      : 0;

    const taskCompletionRate = stats.tasks?.total > 0 
      ? Math.round((stats.tasks.completed / stats.tasks.total) * 100)
      : 0;

    const supTaskCompletionRate = stats.supTasks?.total > 0 
      ? Math.round((stats.supTasks.completed / stats.supTasks.total) * 100)
      : 0;

    const overallCompletionRate = Math.round(
      (projectCompletionRate + taskCompletionRate + supTaskCompletionRate) / 3
    );

    return {
      projectCompletionRate,
      taskCompletionRate,
      supTaskCompletionRate,
      overallCompletionRate,
      
      projects: {
        total: stats.projects?.total || 0,
        completed: stats.projects?.completed || 0,
        pending: stats.projects?.total - stats.projects?.completed || 0,
        completionRate: projectCompletionRate
      },
      
      tasks: {
        total: stats.tasks?.total || 0,
        completed: stats.tasks?.completed || 0,
        pending: stats.tasks?.total - stats.tasks?.completed || 0,
        completionRate: taskCompletionRate
      },
      
      supTasks: {
        total: stats.supTasks?.total || 0,
        completed: stats.supTasks?.completed || 0,
        pending: stats.supTasks?.total - stats.supTasks?.completed || 0,
        completionRate: supTaskCompletionRate
      }
    };
  };

  const stats = calculateCompletionRates(userStats);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-300 font-medium">{t('error')}</h3>
          <p className="text-red-600 dark:text-red-400 mt-1">{error}</p>
          <button
            onClick={fetchUserStatistics}
            className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {t('dashboard')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('userStatisticsOverview')}
        </p>
      </div>

      {/* Summary Cards Grid */}
      <CardGrid cols={3}>
        {/* Total Projects */}
        <StatCard
          title={t('totalProjects')}
          value={stats.projects?.total || 0}
          icon={Briefcase}
          color="purple"
          trend="up"
          trendValue={`${stats.projects?.completed || 0} ${t('completed')}`}
        />

        {/* Total Tasks */}
        <StatCard
          title={t('totalTasks')}
          value={stats.tasks?.total || 0}
          icon={ListTodo}
          color="blue"
          trend="up"
          trendValue={`${stats.tasks?.completed || 0} ${t('completed')}`}
        />

        {/* Total Sub-Tasks */}
        <StatCard
          title={t('totalSubTasks')}
          value={stats.supTasks?.total || 0}
          icon={Layers}
          color="green"
          trend="up"
          trendValue={`${stats.supTasks?.completed || 0} ${t('completed')}`}
        />

       
      </CardGrid>

      {/* Completion Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects Progress */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Briefcase size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('projectsProgress')}
              </h3>
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {stats.projects?.completionRate || 0}%
            </span>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('completed')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {stats.projects?.completed || 0}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({stats.projects?.total > 0 ? Math.round((stats.projects.completed / stats.projects.total) * 100) : 0}%)
                  </span>
                </div>
              </div>
              <ProgressBar
                value={stats.projects?.completionRate || 0}
                height="h-2"
                color="purple"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('pending')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {stats.projects?.pending || 0}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({stats.projects?.total > 0 ? Math.round((stats.projects.pending / stats.projects.total) * 100) : 0}%)
                  </span>
                </div>
              </div>
              <ProgressBar
                value={stats.projects?.total > 0 ? (stats.projects.pending / stats.projects.total) * 100 : 0}
                height="h-2"
                color="yellow"
              />
            </div>
          </div>
        </Card>

        {/* Tasks Progress */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <ListTodo size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('tasksProgress')}
              </h3>
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {stats.tasks?.completionRate || 0}%
            </span>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('completed')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {stats.tasks?.completed || 0}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({stats.tasks?.total > 0 ? Math.round((stats.tasks.completed / stats.tasks.total) * 100) : 0}%)
                  </span>
                </div>
              </div>
              <ProgressBar
                value={stats.tasks?.completionRate || 0}
                height="h-2"
                color="blue"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('pending')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {stats.tasks?.pending || 0}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({stats.tasks?.total > 0 ? Math.round((stats.tasks.pending / stats.tasks.total) * 100) : 0}%)
                  </span>
                </div>
              </div>
              <ProgressBar
                value={stats.tasks?.total > 0 ? (stats.tasks.pending / stats.tasks.total) * 100 : 0}
                height="h-2"
                color="yellow"
              />
            </div>
          </div>
        </Card>

        {/* Sub-Tasks Progress */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Layers size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('subTasksProgress')}
              </h3>
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {stats.supTasks?.completionRate || 0}%
            </span>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('completed')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {stats.supTasks?.completed || 0}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({stats.supTasks?.total > 0 ? Math.round((stats.supTasks.completed / stats.supTasks.total) * 100) : 0}%)
                  </span>
                </div>
              </div>
              <ProgressBar
                value={stats.supTasks?.completionRate || 0}
                height="h-2"
                color="green"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('pending')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {stats.supTasks?.pending || 0}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({stats.supTasks?.total > 0 ? Math.round((stats.supTasks.pending / stats.supTasks.total) * 100) : 0}%)
                  </span>
                </div>
              </div>
              <ProgressBar
                value={stats.supTasks?.total > 0 ? (stats.supTasks.pending / stats.supTasks.total) * 100 : 0}
                height="h-2"
                color="yellow"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Completion Rates Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <BarChart3 size={20} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('completionRates')}
            </h3>
          </div>
        </div>

        <div className="space-y-6">
          {/* Projects Completion */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('projects')}
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {stats.projects?.completionRate || 0}%
              </span>
            </div>
            <ProgressBar
              value={stats.projects?.completionRate || 0}
              height="h-3"
              color="purple"
            />
          </div>

          {/* Tasks Completion */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('tasks')}
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {stats.tasks?.completionRate || 0}%
              </span>
            </div>
            <ProgressBar
              value={stats.tasks?.completionRate || 0}
              height="h-3"
              color="blue"
            />
          </div>

          {/* Sub-Tasks Completion */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('subTasks')}
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {stats.supTasks?.completionRate || 0}%
              </span>
            </div>
            <ProgressBar
              value={stats.supTasks?.completionRate || 0}
              height="h-3"
              color="green"
            />
          </div>
        </div>
      </Card>

      {/* Detailed Statistics */}
     

           
     

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={fetchUserStatistics}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
        >
          <Activity size={16} />
          {t('refreshData')}
        </button>
      </div>
    </div>
  );
}