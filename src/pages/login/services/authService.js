// src/services/authService.js
import api from "../../../services/api"; // Adjust the path if api.js is in a different location relative to authService.js

export const loginUser = async (username, password) => {
  const response = await api.post("/login", { username, password });
  return response.data;
};