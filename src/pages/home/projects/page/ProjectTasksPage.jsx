// src/pages/home/projects/page/ProjectTasksPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { projectService } from "../../../admin/projects/services/projectService";
import Layout from "../../../../components/Layout/Layout";
import Button from "../../../../components/UI/Button";
import Card from "../../../../components/UI/TaskCard";
import Badge from "../../../../components/UI/Badge";

export default function ProjectTasksPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectResult, tasksResult] = await Promise.all([
          projectService.getProjectById(projectId),
          projectService.getProjectTasks(projectId)
        ]);
        
        setProject(projectResult.data);
        setTasks(tasksResult.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const handleBack = () => {
    navigate(`/home/projects/${projectId}`);
  };

  const handleViewTask = (taskId) => {
    navigate(`/home/tasks/${taskId}`);
  };

  const handleCreateTask = () => {
    navigate(`/home/projects/${projectId}/tasks/create`);
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchTerm === "" || 
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Complete": return "success";
      case "Underimplementation": return "primary";
      case "Notimplemented": return "warning";
      case "Pause": return "secondary";
      default: return "default";
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={t("projectTasks")}
      subtitle={project?.name}
      onBack={handleBack}
      backLabel={t("backToProject")}
      actions={
        <div className="flex gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-blue-50 dark:bg-blue-900/20" : ""}
            >
              <Grid size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-blue-50 dark:bg-blue-900/20" : ""}
            >
              <List size={16} />
            </Button>
          </div>
          <Button onClick={handleCreateTask}>
            <Plus size={20} className="mr-2" />
            {t("addTask")}
          </Button>
        </div>
      }
    >
      {/* Search and Filter */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t("searchTasks")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">{t("allStatuses")}</option>
              <option value="Notimplemented">{t("notImplemented")}</option>
              <option value="Underimplementation">{t("underImplementation")}</option>
              <option value="Complete">{t("completed")}</option>
              <option value="Pause">{t("paused")}</option>
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>
      </Card>

      {/* Tasks List */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("tasks")} ({filteredTasks.length})
            </h2>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t("noTasks")}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t("noTasksDescription")}
            </p>
            <Button onClick={handleCreateTask}>
              {t("createFirstTask")}
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="hover:shadow-lg transition-shadow">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {task.name}
                    </h3>
                    <Badge color={getStatusColor(task.status)}>
                      {t(task.status)}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {task.description || t("noDescription")}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {task.assignee_name || "Unassigned"}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewTask(task.id)}
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t("taskName")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t("assignee")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t("status")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t("dueDate")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t("actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {task.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {task.description || t("noDescription")}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {task.assignee_name || "Unassigned"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge color={getStatusColor(task.status)}>
                        {t(task.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {task.end_date ? new Date(task.end_date).toLocaleDateString() : "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewTask(task.id)}
                      >
                        <ChevronRight size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </Layout>
  );
}