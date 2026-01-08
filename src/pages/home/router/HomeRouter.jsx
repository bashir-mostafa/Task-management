// src/pages/home/router/HomeRouter.jsx
import { Routes, Route } from "react-router-dom";
import DashboardPage from "../dashborad/pages/DashboardPage";
import SettingsPage from "../settings/pages/SettingsPage";
import ProjectsPage from "../projects/page/ProjectsPage";
import ProjectDetailsPage from "../projects/page/ProjectDetailsPage";
 import TasksPage from "../tasks/pages/TasksPage";
// import TaskDetailsPage from "../tasks/pages/TaskDetailsPage";
// import SubtasksPage from "../tasks/pages/SubtasksPage";

export default function HomeRouter() {
  console.log("HomeRouter rendered");
  return (
    <Routes>
      {/* الصفحة الرئيسية */}
      <Route index element={<DashboardPage />} />
      
      {/* مسارات المشاريع */}
      <Route path="projects" element={<ProjectsPage />} />
      <Route path="projects/:projectId" element={<ProjectDetailsPage />} />
      {/* <Route path="projects/:projectId/tasks" element={<ProjectTasksPage />} />  */}
      
      {/* مسارات المهام الخاصة بالمستخدم */}
       <Route path="tasks" element={<TasksPage />} />
      {/* <Route path="tasks/:taskId" element={<TaskDetailsPage />} />
      <Route path="tasks/:taskId/subtasks" element={<SubtasksPage />} />  */}
      
      {/* إعدادات المستخدم */}
      <Route path="settings" element={<SettingsPage />} />
      
    
    </Routes>
  );
}

