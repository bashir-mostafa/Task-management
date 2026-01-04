import React from "react";
import { Routes, Route } from "react-router-dom";

import ProjectDetailsPage from "../pages/project/ProjectDetailsPage";
import ProjectEditPage from "../pages/project/ProjectEditPage";
import ProjectTasksPage from "../pages/tasks/ProjectTasksPage";
import ProjectTaskCreatePage from "../pages/tasks/ProjectTaskCreatePage";
import ProjectTaskEditPage from "../pages/tasks/ProjectTaskEditPage";
import ProjectTaskDetailsPage from "../pages/tasks/ProjectTaskDetailsPage";
import ProjectUsersPage from "../pages/users/ProjectUsersPage";
import ProjectsPage from "../pages/project/ProjectsPage";
import TaskAssignmentPage from "../pages/tasks/TaskAssignmentPage";

import SupTaskDetailsPage from "../pages/SupTask/SupTaskDetailsPage";
import SupTaskCreatePage from "../pages/SupTask/SupTaskCreatePage";
import SupTaskEditPage from "../pages/SupTask/SupTaskEditPage";
import SupTasksListPage from "../pages/SupTask/SupTasksListPage";
import ProjectCreatePage from "../pages/project/ProjectCreatePage";

export default function ProjectsRouter() {
  return (
    <Routes>
      {/* مسارات المشروع */}
      <Route path=":projectId">
        <Route index element={<ProjectDetailsPage />} />
        <Route path="create" element={<ProjectCreatePage />} />
        <Route path="edit" element={<ProjectEditPage />} />
        
        {/* المهام */}
        <Route path="tasks">
          <Route index element={<ProjectTasksPage />} />
          <Route path="create" element={<ProjectTaskCreatePage />} />
          <Route path=":taskId">
            <Route index element={<ProjectTaskDetailsPage />} />
            <Route path="edit" element={<ProjectTaskEditPage />} />
            <Route path="assign-users" element={<TaskAssignmentPage />} />
            
            {/* المهام الفرعية */}
            <Route path="subtasks">
              <Route index element={<SupTasksListPage />} />
              <Route path="create" element={<SupTaskCreatePage />} />
              <Route path=":supTaskId">
                <Route index element={<SupTaskDetailsPage />} />
                <Route path="edit" element={<SupTaskEditPage />} />
              </Route>
            </Route>
          </Route>
        </Route>
        
        {/* المستخدمين */}
        <Route path="users" element={<ProjectUsersPage />} />
        
        {/* صفحات أخرى */}
        <Route path="export" element={<div>Export Page</div>} />
        <Route path="activity" element={<div>Activity Log</div>} />
        <Route path="notifications" element={<div>Notifications</div>} />
        <Route path="messages" element={<div>Messages</div>} />
      </Route>
      
      {/* صفحات أخرى */}
      <Route path="create" element={<ProjectCreatePage />} />
      <Route index element={<ProjectsPage />} />
    </Routes>
  );
}