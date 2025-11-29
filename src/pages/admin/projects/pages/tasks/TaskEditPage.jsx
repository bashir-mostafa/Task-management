// src/pages/admin/projects/pages/TaskEditPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Save } from "lucide-react";
import { taskService } from "../../services/taskService";
import useDarkMode from "../../../../../hooks/useDarkMode";
import Button from "../../../../../components/UI/Button";
import Input from "../../../../../components/UI/InputField";
import TextArea from "../../../../../components/UI/TextAreaField";
import Select from "../../../../../components/UI/Select";

export default function TaskEditPage() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isDark } = useDarkMode();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [task, setTask] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: 1,
    success_rate: 0,
    evaluation_admin: 0,
    notes_admin: ""
  });

  const isRTL = i18n.language === "ar";

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const taskData = await taskService.getTaskById(taskId);
        setTask(taskData);
        
        // تعبئة النموذج ببيانات المهمة
        setFormData({
          name: taskData.name || "",
          description: taskData.description || "",
          start_date: taskData.start_date ? new Date(taskData.start_date).toISOString().split('T')[0] : "",
          end_date: taskData.end_date ? new Date(taskData.end_date).toISOString().split('T')[0] : "",
          status: taskData.status || 1,
          success_rate: taskData.success_rate || 0,
          evaluation_admin: taskData.evaluation_admin || 0,
          notes_admin: taskData.notes_admin || ""
        });

      } catch (error) {
        console.error("Error fetching task:", error);
        alert(t("fetchError"));
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchTask();
    }
  }, [taskId, t]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await taskService.updateTask(taskId, {
        ...formData,
        project_id: parseInt(projectId)
      });
      
      alert(t("taskUpdatedSuccessfully"));
      navigate(`/dashboard/projects/${projectId}/tasks`);
    } catch (error) {
      console.error("Error updating task:", error);
      alert(t("updateError"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-background text-text">
      {/* Header */}
      <div className={`flex items-center justify-between mb-6 ${isRTL ? "flex-row-reverse" : ""}`}>
        <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
          <Button
            onClick={() => navigate(`/dashboard/projects/${projectId}/tasks`)}
            variant="secondary"
            className={`flex items-center gap-2 !w-auto px-4 py-2 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <ArrowLeft size={20} />
            <span>{t("backToTasks")}</span>
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t("editTask")}
            </h1>
            {task && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {task.name}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="space-y-6">
            <Input
              label={t("taskName")}
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />

            <TextArea
              label={t("description")}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="date"
                label={t("startDate")}
                value={formData.start_date}
                onChange={(e) => handleInputChange("start_date", e.target.value)}
                required
              />

              <Input
                type="date"
                label={t("endDate")}
                value={formData.end_date}
                onChange={(e) => handleInputChange("end_date", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label={t("status")}
                value={formData.status}
                onChange={(e) => handleInputChange("status", parseInt(e.target.value))}
              >
                <option value={0}>{t("pending")}</option>
                <option value={1}>{t("inProgress")}</option>
                <option value={2}>{t("completed")}</option>
              </Select>

              <Input
                type="number"
                label={t("successRate")}
                value={formData.success_rate}
                onChange={(e) => handleInputChange("success_rate", parseInt(e.target.value))}
                min="0"
                max="100"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                label={t("evaluation")}
                value={formData.evaluation_admin}
                onChange={(e) => handleInputChange("evaluation_admin", parseInt(e.target.value))}
                min="0"
                max="10"
              />
            </div>

            <TextArea
              label={t("adminNotes")}
              value={formData.notes_admin}
              onChange={(e) => handleInputChange("notes_admin", e.target.value)}
              rows={3}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/dashboard/projects/${projectId}/tasks`)}
                className="flex-1"
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center gap-2 justify-center"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save size={16} />
                )}
                <span>{t("saveChanges")}</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}