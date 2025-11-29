// src/services/AdminSettingService.js
import api from "../../../../services/api";

export const changePassword = async ({ password, newpassword }) => {
  try {
    const response = await api.put("/Users/ChangePassword", {
      password,
      newpassword,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};