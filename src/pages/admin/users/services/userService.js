// src/services/userService.js
import api from '../../../../services/api';

export const userService = {
    // الحصول على جميع المستخدمين مع الفلترة والترقيم
    getUsers: async (params = {}) => {
      // تنظيف المعلمات - إزالة القيم الفارغة
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
      );
      
      // استخدام المسار الصحيح بدون تكرار /api
      const response = await api.get('/Users', { params: cleanParams });
      return response.data;
    },
  
    // الحصول على مستخدم بواسطة ID
    getUserById: async (id) => {
      const response = await api.get(`/Users/${id}`);
      return response.data;
    },
  
    // الحصول على مستخدم بواسطة username
    getUserByUsername: async (username) => {
      const response = await api.get(`/Users/by-username/${username}`);
      return response.data;
    },
  
    // إنشاء مستخدم جديد
    createUser: async (userData) => {
      const response = await api.post('/Users', userData);
      return response.data;
    },
  
    // تحديث كلمة المرور بواسطة المدير
    adminChangePassword: async (data) => {
      const response = await api.put('/Users/AdminChanchingPassword', data);
      return response.data;
    },
  
    // تغيير كلمة المرور
    changePassword: async (data) => {
      const response = await api.put('/Users/ChangePassword', data);
      return response.data;
    },
  
    // حذف مستخدم
    deleteUser: async (id) => {
      const response = await api.delete(`/Users/${id}`);
      return response.data;
    },
  
    // حذف متعدد
    deleteMultipleUsers: async (ids) => {
      const response = await api.delete('/Users/Multiple_delete', { data: ids });
      return response.data;
    }
  };