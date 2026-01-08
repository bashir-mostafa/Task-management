// src/services/taskService.js
import api from '../../../../services/api';

export const taskService = {
  // Get all tasks for a project
  getTasksByProject: async (projectId, params = {}) => {
    const response = await api.get('/Task', {
      params: {
        priojectid: projectId,
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 20,
        ...params
      }
    });
    return response.data;
  },

  // Get single task by ID
  getTaskById: async (taskId) => {
    const response = await api.get(`/Task/${taskId}`);
    return response.data;
  },

  // Create a new task
  createTask: async (taskData) => {
    console.log('🔄 Creating task with data:', taskData);
    
    // Helper function to convert status number to string
    const getStatusText = (statusNumber) => {
      const statusMap = {
        0: "Notimplemented",
        1: "Underimplementation",
        2: "Complete"
      };
      return statusMap[statusNumber] || "Notimplemented";
    };
    
    const requestData = {
      name: taskData.name,
      description: taskData.description,
      project_id: taskData.project_id,
      start_date: taskData.start_date,
      end_date: taskData.end_date,
      status: getStatusText(taskData.status), // Convert number to string
      evaluation_admin: taskData.evaluation_admin || null,
      notes_admin: taskData.notes_admin || ""
    };

    console.log('📤 Sending request data:', requestData);

    try {
      const response = await api.post('/Task', requestData);
      console.log('✅ Task created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating task:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        requestData: requestData
      });
      throw error;
    }
  },

  // Update a task
  updateTask: async (taskId, taskData) => {
    console.log('🔄 Updating task with data:', { taskId, taskData });
    
    // Helper function to convert status number to string
    const getStatusText = (statusNumber) => {
      const statusMap = {
        0: "Notimplemented",
        1: "Underimplementation",
        2: "Complete"
      };
      return statusMap[statusNumber] || "Notimplemented";
    };
    
    const requestData = {
      name: taskData.name,
      description: taskData.description,
      project_id: taskData.project_id,
      start_date: taskData.start_date,
      end_date: taskData.end_date,
      status: getStatusText(taskData.status), // Convert number to string
      evaluation_admin: taskData.evaluation_admin || 0,
      notes_admin: taskData.notes_admin || ""
    };

    console.log('📤 Sending update request data:', requestData);

    try {
      const response = await api.put(`/Task/${taskId}`, requestData);
      console.log('✅ Task updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating task:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        requestData: requestData
      });
      throw error;
    }
  },

  // Delete a task
  deleteTask: async (taskId) => {
    const response = await api.delete(`/Task/${taskId}`);
    return response.data;
  },

  // Pause a task
  pauseTask: async (taskId) => {
    const response = await api.post(`/Task/${taskId}/pause`);
    return response.data;
  },

  // Resume a task
  resumeTask: async (taskId) => {
    const response = await api.post(`/Task/${taskId}/resume`);
    return response.data;
  },

  // Get task status counts
  getTaskStatusCounts: async (projectId) => {
    const response = await api.get('/Task', {
      params: {
        priojectid: projectId,
        pageNumber: 1,
        pageSize: 1
      }
    });
    return response.data.statusCount || [];
  },
getTaskUser: async ()=>{
  const response = await api.get('/TaskUser');
    return response.data;
  },
  // Helper function to convert status string to number (for form)
  getStatusNumber: (statusText) => {
    const statusMap = {
      "Notimplemented": 0,
      "Underimplementation": 1,
      "Complete": 2,
      "Pause": 3
    };
    return statusMap[statusText] || 0;
  }
};