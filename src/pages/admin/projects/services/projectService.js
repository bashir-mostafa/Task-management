// src/services/projectService.js
import api from "../../../../services/api";

export const projectService = {
  getProjects: async (params = {}) => {
    const response = await api.get("/Project", { params });
    return response.data;
  },

  getProjectById: async (id) => {
    const response = await api.get(`/Project/${id}`);
    console.log("Project details response:", response.data);
    return response.data;
  },

  createProject: async (projectData) => {
    const response = await api.post("/Project", projectData);
    console.log(response.data);
    return response.data;
  },

  updateProject: async (id, projectData) => {
    const response = await api.put(`/Project/${id}`, projectData);
    return response.data;
  },

  deleteProject: async (id) => {
    const response = await api.delete(`/Project/${id}`);
    return response.data;
  },

  deleteMultipleProjects: async (ids) => {
    const response = await api.delete("/Project/Multiple_delete", {
      data: ids,
    });
    return response.data;
  },
};

export default projectService;