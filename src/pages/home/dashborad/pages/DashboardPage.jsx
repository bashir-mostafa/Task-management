// src/pages/admin/dashboard/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Briefcase,
  CheckCircle,
  Clock,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import dashboardService from '../services/dashboardService';
import StatCard from '../../../../components/UI/StatCard';

export default function DashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    users: null,
    projects: null,
    tasks: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const userStats = await dashboardService.getUserStatistics();
      console.log('User statistics:', userStats);
      
      // افترض أن البيانات تأتي بهذا الشكل
      // { total: 100, completed: 50, active: 30, ... }
      
      setStats({
        users: userStats,
        // يمكنك إضافة بيانات أخرى هنا
      });
    } catch (err) {
      setError(t('fetchError'));
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
            onClick={fetchDashboardData}
            className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('dashboardSubtitle')}
        </p>
      </div>

      {/* إحصائيات المستخدمين */}
      {stats.users && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            {t('userStatistics')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {typeof stats.users.total === 'number' && (
              <StatCard
                title={t('totalUsers')}
                value={stats.users.total}
                icon={Users}
                color="blue"
                trend="up"
              />
            )}
            
            {typeof stats.users.active === 'number' && (
              <StatCard
                title={t('activeUsers')}
                value={stats.users.active}
                icon={Users}
                color="green"
                trend="up"
              />
            )}
            
            {typeof stats.users.newThisMonth === 'number' && (
              <StatCard
                title={t('newUsersThisMonth')}
                value={stats.users.newThisMonth}
                icon={TrendingUp}
                color="purple"
                trend="up"
              />
            )}
            
            {typeof stats.users.completed === 'number' && (
              <StatCard
                title={t('tasksCompleted')}
                value={stats.users.completed}
                icon={CheckCircle}
                color="green"
                trend="up"
              />
            )}
          </div>
        </div>
      )}

      {/* عرض تفاصيل البيانات إذا كانت كائن */}
      {stats.users && typeof stats.users === 'object' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            {t('detailedStatistics')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.users).map(([key, value]) => (
              <div key={key} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                  {typeof value === 'number' && (
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {value}
                    </span>
                  )}
                </div>
                {typeof value === 'object' ? (
                  <div className="space-y-1">
                    {Object.entries(value).map(([subKey, subValue]) => (
                      <div key={subKey} className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-500 capitalize">
                          {subKey.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </span>
                        <span className="font-medium dark:text-white">
                          {typeof subValue === 'number' ? subValue : String(subValue)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {typeof value === 'number' ? (
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${Math.min(value, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      String(value)
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}