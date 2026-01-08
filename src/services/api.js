import axios from "axios";

const API_BASE = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("access")}`,
  },
});
 
//  يمكن تفعيل هذا الخيار إذا كان الخادم يدعم ملفات تعريف الارتباط
// api.defaults.withCredentials = true;

export default api;
