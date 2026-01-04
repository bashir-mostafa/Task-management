// src/components/Projects/TaskModal.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, Calendar, User } from "lucide-react";

export default function TaskModal({ 
  open, 
  onClose, 
  onSave, 
  task, 
  projectId,
  isRTL = false 
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "Underimplementation", // Use API enum values
    user_id: "",
    successrate: 0,
    evaluationAdmin: 0,
    notesadmin: ""
  });

  useEffect(() => {
    if (task) {
      console.log('📝 Editing task:', task);
      
      // Convert numeric status to string for editing
      const statusMap = {
        0: "Underimplementation",
        1: "Underimplementation", 
        2: "Complete"
      };
  
      setFormData({
        name: task.name || "",
        description: task.description || "",
        start_date: task.start_date ? task.start_date.split('T')[0] : "",
        end_date: task.end_date ? task.end_date.split('T')[0] : "",
        status: statusMap[task.status] || "Underimplementation",
        user_id: task.user_id || "",
        successrate: task.successrate || 0,
        evaluationAdmin: task.evaluationAdmin || 0,
        notesadmin: task.notesadmin || ""
      });
    } else {
      setFormData({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        status: "Underimplementation",
        user_id: "",
        successrate: 0,
        evaluationAdmin: 0,
        notesadmin: ""
      });
    }
  }, [task, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare data for API - use the exact field names API expects
    const apiData = {
      name: formData.name,
      description: formData.description,
      project_id: parseInt(projectId),
      successrate: formData.successrate,
      status: formData.status,
      // Use the exact field names the API expects
      startdate: formData.start_date ? new Date(formData.start_date).toISOString() : new Date().toISOString(),
      enddate: formData.end_date ? new Date(formData.end_date).toISOString() : new Date().toISOString(),
      evaluationAdmin: formData.evaluationAdmin,
      notesadmin: formData.notesadmin
    };
    
    onSave(apiData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {task ? t("editTask") : t("addTask")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            type="button"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Task Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("taskName")} *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder={t("enterTaskName")}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("description")}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder={t("enterTaskDescription")}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("startDate")} *
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("endDate")} *
              </label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => handleChange("end_date", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Status - Updated to match API enum */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("status")}
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="Underimplementation">{t("inProgress")}</option>
              <option value="Complete">{t("completed")}</option>
              <option value="Pause">{t("paused")}</option>
              <option value="Notimplemented">{t("notImplemented")}</option>
            </select>
          </div>

          {/* Additional Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("successRate")} (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.successrate}
              onChange={(e) => handleChange("successrate", parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="0-100"
            />
          </div>

          {/* Admin Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("adminNotes")}
            </label>
            <textarea
              value={formData.notesadmin}
              onChange={(e) => handleChange("notesadmin", e.target.value)}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder={t("enterAdminNotes")}
            />
          </div>

          {/* Buttons */}
          <div className={`flex gap-3 pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:from-primary/90 hover:to-secondary/90 transition-colors font-medium"
            >
              {task ? t("updateTask") : t("createTask")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}