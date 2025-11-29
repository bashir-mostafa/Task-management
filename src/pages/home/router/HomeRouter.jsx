// src/pages/home/router/HomeRouter.jsx (جديد: للمستخدم العادي)
import { Routes, Route } from "react-router-dom";
import DashboardPage from "../dashborad/pages/DashboardPage";
import SettingsPage from "../settings/pages/SettingsPage";
// أضف صفحات أخرى إذا لزم الأمر

export default function HomeRouter() {
  return (
    <Routes>
      <Route index element={<DashboardPage />} />
<Route path ="settings" element ={<SettingsPage/>} />

      {/* روابط أخرى للمستخدم العادي، مثل /home/profile */}
    </Routes>
  );
}
