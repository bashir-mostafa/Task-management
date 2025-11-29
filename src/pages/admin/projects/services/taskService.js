// src/services/taskService.js
import api from '../../../../services/api';

export const taskService = {
  // Get all tasks for a project
  getTasksByProject: async (projectId) => {
    const response = await api.get(`/project/${projectId}`);
    return response.data;
  },

  // Get single task by ID
  getTaskById: async (taskId) => {
    const response = await api.get(`/Task/${taskId}`);
    console.log(response)
    return response.data;
  },

  // Create a new task
  createTask: async (taskData) => {
    const response = await api.post('/Task/UserAndTask', {
      name: taskData.name,
      description: taskData.description,
      project_id: taskData.project_id,
      successrate: taskData.successrate || 0,
      status: taskData.status || "Underimplementation",
      startdate: taskData.startdate || taskData.start_date,
      enddate: taskData.enddate || taskData.end_date,
      evaluationAdmin: taskData.evaluationAdmin || 0,
      notesadmin: taskData.notesadmin || ""
    });
    return response.data;
  },

  // Update a task
  updateTask: async (taskId, taskData) => {
    console.log('🔄 updateTask called with:', { taskId, taskData });
    
    const requestData = {
      name: taskData.name,
      description: taskData.description,
      project_id: taskData.project_id,
      successrate: taskData.successrate || 0,
      status: taskData.status,
      startdate: taskData.startdate || taskData.start_date,
      enddate: taskData.enddate || taskData.end_date,
      evaluationAdmin: taskData.evaluationAdmin || 0,
      notesadmin: taskData.notesadmin || ""
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
  }
};