// src/pages/admin/projects/router/ProjectsRouter.jsx
import { Routes, Route } from "react-router-dom";
import ProjectsPage from "../pages/project/ProjectsPage";
import ProjectDetailsPage from "../pages/project/ProjectDetailsPage";
import ProjectCreatePage from "../pages/project/ProjectCreatePage";
import ProjectEditPage from "../pages/project/ProjectEditPage";
import TaskCreatePage from "../pages/tasks/TaskCreatePage";
import AddUsersToProjectPage from "../pages/users/AddUsersToProjectPage";
import TaskAssignmentPage from "../pages/tasks/TaskAssignmentPage";
import ProjectUsersManagementPage from "../pages/users/ProjectUsersManagementPage";
import TaskManagementPage from "../pages/tasks/TaskManagementPage";
import TaskEditPage from "../pages/tasks/TaskEditPage";
import TaskDetailsPage from "../pages/tasks/TaskDetailsPage"; // إضافة هذه الصفحة

export default function ProjectsRouter() {
  return (
    <Routes>
      {/* الصفحة الرئيسية للمشاريع */}
      <Route index element={<ProjectsPage />} />

      {/* إنشاء مشروع جديد */}
      <Route path="create" element={<ProjectCreatePage />} />

      {/* مسارات المشروع الفردي */}
      <Route path=":projectId">
        {/* تفاصيل المشروع */}
        <Route index element={<ProjectDetailsPage />} />

        {/* تحرير المشروع */}
        <Route path="edit" element={<ProjectEditPage />} />

        {/* إدارة المهام */}
        <Route path="tasks">
          <Route index element={<TaskManagementPage />} />
          <Route path="create" element={<TaskCreatePage />} />
          <Route path=":taskId">
            <Route index element={<TaskDetailsPage />} />{" "}
            {/* إضافة هذه السطر */}
            <Route path="edit" element={<TaskEditPage />} />
            <Route path="assign-users" element={<TaskAssignmentPage />} />
          </Route>
        </Route>

        {/* إدارة المستخدمين */}
        <Route path="users">
          <Route index element={<ProjectUsersManagementPage />} />
          <Route path="add" element={<AddUsersToProjectPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
