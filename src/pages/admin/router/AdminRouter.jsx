// src/pages/admin/router/AdminRouter.jsx
import { Routes, Route } from "react-router-dom";
import DashboardPage from "../dashboard/pages/DashboardPage";
import SettingsPage from "../settings/pages/SettingsPage";
import UsersPage from "../users/pages/UsersPage";
import TasksPage from "../tasks/pages/TasksPage";
import ProjectsRouter from "../projects/router/ProjectsRouter";

export default function AdminRouter() {
  return (
    <Routes>
      <Route index element={<DashboardPage />} />
      <Route path="projects/*" element={<ProjectsRouter />} />
      <Route path="tasks" element={<TasksPage />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="settings" element={<SettingsPage />} />
    </Routes>
  );
}