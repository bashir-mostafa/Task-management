// src/services/authService.js
import api from "../../../services/api"; 

export const loginUser = async (username, password) => {
  const response = await api.post("/login", { username, password });
  return response.data;
};