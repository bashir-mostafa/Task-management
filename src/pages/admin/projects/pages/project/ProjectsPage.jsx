import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ProjectCard from "../../components/project/ProjectCard";
import ProjectFilters from "../../components/project/ProjectFilters";
import ProjectModal from "../../components/project/ProjectModal";
import DeleteConfirmationModal from "../../../../../components/UI/DeleteConfirmationModal";
import Toast from "../../../../../components/Toast";
import CustomDropdown from "../../../../../components/UI/Dropdown";
import Pagination from "../../../../../components/UI/Pagination";
import Button from "../../../../../components/UI/Button";

import { projectService } from "../../services/projectService";
import useDarkMode from "../../../../../hooks/useDarkMode";
import { useAuth } from "../../../../../contexts/AuthContext";

export default function ProjectsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isDark, colorTheme } = useDarkMode();
  const { state: authState } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  // الفلاتر المبسطة
  const [filters, setFilters] = useState({
    name: "",
    status: "",
    Project_Manager_id: "",
  });

  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 12,
    totalCount: 0,
  });

  const [selectedProjects, setSelectedProjects] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const isRTL = i18n.language === "ar";
  const currentUser = authState.user;

  // Toast State
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  // Fetch projects
  const fetchProjects = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("Fetching projects with filters:", filters);

      const result = await projectService.getProjects({
        ...filters,
        PageNumber: pagination.pageNumber,
        PageSize: pagination.pageSize,
      });
      
      console.log("Projects fetched:", result);
      
      if (result && result.data) {
        setProjects(result.data);
        setPagination(prev => ({ 
          ...prev, 
          totalCount: result.totalCount || 0 
        }));
      } else {
        setProjects([]);
        setPagination(prev => ({ ...prev, totalCount: 0 }));
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      showToast(t("fetchError"), "error");
      setProjects([]);
      setPagination(prev => ({ ...prev, totalCount: 0 }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchProjects();
    }, 300); // Debounce for 300ms

    return () => clearTimeout(debounceTimer);
  }, [filters, pagination.pageNumber, pagination.pageSize]);

  const handleResetFilters = () => {
    setFilters({
      name: "",
      status: "",
      Project_Manager_id: "",
    });
    setPagination((prev) => ({ ...prev, pageNumber: 1 }));
  };

  const handleFilterChange = (newFilters) => {
    console.log("Filter changed:", newFilters);
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, pageNumber: 1 }));
  };

  const handlePageSizeChange = (size) => {
    setPagination((prev) => ({
      ...prev,
      pageSize: parseInt(size),
      pageNumber: 1,
    }));
  };

  // دالة تغيير الصفحة
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      pageNumber: newPage
    }));
  };

  // Delete single project
  const handleDelete = async (id) => {
    try {
      await projectService.deleteProject(id);
      await fetchProjects();
      setSelectedProjects((prev) =>
        prev.filter((projectId) => projectId !== id)
      );
      showToast(t("projectDeletedSuccessfully"), "success");
    } catch (error) {
      console.error("Delete error:", error);
      showToast(t("deleteError"), "error");
    }
  };

  // Delete multiple projects
  const handleDeleteMultiple = async () => {
    try {
      await projectService.deleteMultipleProjects(selectedProjects);
      await fetchProjects();
      setSelectedProjects([]);
      setBulkDeleteModalOpen(false);
      showToast(t("projectsDeletedSuccessfully"), "success");
    } catch (error) {
      console.error("Bulk delete error:", error);
      showToast(t("deleteError"), "error");
    }
  };

  const handleEdit = (project) => {
    navigate(`/projects/${project.id}/edit`);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingProject(null);
  };

  const handleSaveProject = async (projectData) => {
    try {
      if (editingProject) {
        await projectService.updateProject(editingProject.id, projectData);
        showToast(t("projectUpdatedSuccessfully"), "success");
      } else {
        await projectService.createProject(projectData);
        showToast(t("projectCreatedSuccessfully"), "success");
      }

      handleModalClose();
      await fetchProjects();
    } catch (error) {
      console.error("Save error:", error);
      showToast(t("saveError"), "error");
    }
  };

  const toggleProjectSelection = (projectId) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  

  // خيارات حجم الصفحة
  const pageSizeOptions = [
    { value: 12, label: "12" },
    { value: 24, label: "24" },
    { value: 36, label: "36" },
    { value: 50, label: "50" },
  ];

  // SVG Icons
  const GridIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  );

  const ListIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );

  const PlusIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
  );

  return (
    <div className="min-h-screen p-6 bg-background text-text transition-colors duration-300">
      {/* HEADER */}
      <div
        className={`flex justify-between items-center mb-8 ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r mb-2 h-16 from-primary to-secondary bg-clip-text text-transparent">
            {t("projectsManagement")}
          </h1>
          {currentUser && (
            <p className="text/60 font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t("totalProjects")}: {pagination.totalCount}
            </p>
          )}
        </div>

        <div className={`flex gap-3 w-100 ${isRTL ? "flex-row-reverse" : ""}`}>
          {/* View Mode Toggle */}
          <div className="flex bg-text/10 rounded-3xl p-1 h-10">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-3xl transition-all ${
                viewMode === "grid"
                  ? "bg-white/80 dark:bg-gray-600/80 shadow-md text-primary"
                  : "text-text/60 hover:text-text"
              }`}
            >
              <GridIcon />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-3xl transition-all ${
                viewMode === "list"
                  ? "bg-white/80 dark:bg-gray-600/80 shadow-md text-primary"
                  : "text-text/60 hover:text-text"
              }`}
            >
              <ListIcon />
            </button>
          </div>


          <Button
            onClick={() => navigate("/projects/create")}
            className="w-[100%] h-10 flex items-center gap-0 p-4 bg"
          >
            <PlusIcon />
            <span> {t("addProject")}</span>
          </Button>
        </div>
      </div>

      {/* Filters المبسطة */}
      <ProjectFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        className="mb-6"
      />

      {/* Controls */}
      <div
        className={`flex justify-between items-center mb-4 ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        <div
          className={`flex items-center gap-4 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
        

          {/* Page Size */}
          <div
            className={`flex items-center gap-2 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <span className="text-sm text-text/60">
              {t("show")}
            </span>
            <CustomDropdown
              options={pageSizeOptions}
              value={pagination.pageSize}
              onChange={handlePageSizeChange}
              placeholder="12"
              isRTL={isRTL}
              size="small"
              className="w-20 bg-background border-border"
            />
            <span className="text-sm text-text/60">
              {t("entries")}
            </span>
          </div>
        </div>

        <div className="text-sm text-text/60">
          {t("showing")} {(pagination.pageNumber - 1) * pagination.pageSize + 1}{" "}
          -{" "}
          {Math.min(
            pagination.pageNumber * pagination.pageSize,
            pagination.totalCount
          )}{" "}
          {t("of")} {pagination.totalCount}
        </div>
      </div>

      {/* Projects Grid/List */}
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div
          className={`
          ${
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }
        `}
        >
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              viewMode={viewMode}
              isSelected={selectedProjects.includes(project.id)}
              onSelect={toggleProjectSelection}
              onEdit={handleEdit}
              onDelete={(id) => {
                setEditingProject(project);
                setDeleteModalOpen(true);
              }}
              isBulkMode={selectedProjects.length > 0}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && projects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-text/40 text-6xl mb-4">
            📁
          </div>
          <h3 className="text-xl font-semibold text-text/60 mb-2">
            {t("noProjectsFound")}
          </h3>
          <p className="text-text/60 mb-6">
            {t("noProjectsDescription")}
          </p>
          <Button
            onClick={() => navigate("/projects/create")}
            className="!w-auto"
          >
            + {t("createFirstProject")}
          </Button>
        </div>
      )}

      {/* Pagination الموحد */}
      {projects.length > 0 && (
        <div className="mt-8">
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
            itemsName="projects"
            showProgress={true}
          />
        </div>
      )}

      {/* Modals */}
      <ProjectModal
        open={modalOpen}
        onClose={handleModalClose}
        onSave={handleSaveProject}
        project={editingProject}
      />

      {/* Modal حذف فردي */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          if (editingProject) {
            handleDelete(editingProject.id);
            setDeleteModalOpen(false);
          }
        }}
        count={1}
        type="project"
      />

      {/* Modal حذف متعدد */}
      <DeleteConfirmationModal
        open={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        onConfirm={handleDeleteMultiple}
        count={selectedProjects.length}
        type="project"
      />

      {/* Toast Notification */}
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}