// /src/pages/admin/users/services/userService.js
import api from '../../../../services/api';

export const userService = {
  // الحصول على جميع المستخدمين مع الفلترة والترقيم
  getUsers: async (params = {}) => {
    // تنظيف المعلمات - إزالة القيم الفارغة
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => 
        value !== '' && value !== null && value !== undefined
      )
    );
    
    // تعيين القيم الافتراضية
    const defaultParams = {
      PageNumber: cleanParams.PageNumber || 1,
      PageSize: cleanParams.PageSize || 2000000,
      IsDeleted: cleanParams.IsDeleted || false,
      ...cleanParams
    };
    
    const response = await api.get('/Users', { params: defaultParams });
    return response.data;
  },

  // الحصول على جميع المستخدمين النشطين (غير المحذوفين) - بدون تقسيم
  getAllActiveUsers: async () => {
    try {
      // جلب أول 100 مستخدم (يمكن زيادة الرقم حسب احتياجك)
      const response = await api.get('/Users', {
        params: {
          PageNumber: 1,
          PageSize: 1000, // عدد كبير لجلب كل المستخدمين
          IsDeleted: false // فقط المستخدمين النشطين
        }
      });
      
      // إذا كان الـ API يدعم الـ totalCount، يمكننا التحقق
      console.log('Total users fetched:', response.data?.data?.length || response.data?.length);
      return response.data;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  },

  // الحصول على جميع المستخدمين (بما فيهم المحذوفين) - بدون تقسيم
  getAllUsers: async () => {
    try {
      const response = await api.get('/Users', {
        params: {
          PageNumber: 1,
          PageSize: 1000 // عدد كبير
          // لا نضيف IsDeleted هنا لنحصل على الجميع
        }
      });
      
      // تصفية المحذوفين إذا لزم الأمر
      const allUsers = response.data?.data || response.data || [];
      const activeUsers = allUsers.filter(user => !user.isDeleted);
      
      return {
        ...response.data,
        data: activeUsers // نعيد فقط النشطين
      };
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  },

  // البحث في المستخدمين
  searchUsers: async (searchTerm, role = "", pageNumber = 1, pageSize = 20) => {
    const params = {
      PageNumber: pageNumber,
      PageSize: pageSize,
      IsDeleted: false
    };

    if (searchTerm) {
      if (searchTerm.includes("@")) {
        params.email = searchTerm;
      } else {
        params.username = searchTerm;
      }
    }

    if (role) {
      params.role = role;
    }

    return await userService.getUsers(params);
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