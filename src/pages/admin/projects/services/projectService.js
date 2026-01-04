import api from "../../../../services/api";

export const projectService = {
  getProjects: async (params = {}) => {
    try {
      const response = await api.get("/Project", {
        params: params,
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getProjectById: async (id) => {
    try {
      const response = await api.get(`/Project/${id}`);
      console.log("Response data:", response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createProject: async (projectData) => {
    try {
      const response = await api.post("/Project", projectData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProject: async (id, projectData) => {
    try {
      const response = await api.put(`/Project/${id}`, projectData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteProject: async (id) => {
    try {
      const response = await api.delete(`/Project/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteMultipleProjects: async (ids) => {
    try {
      const response = await api.delete("/Project/Multiple_delete", {
        data: ids,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default projectService;
