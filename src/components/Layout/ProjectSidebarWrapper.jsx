// src/components/Layout/ProjectSidebarWrapper.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import ProjectSidebar from "./ProjectSidebar";

export default function ProjectSidebarWrapper() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { projectId } = useParams();

  // التحقق مما إذا كنا في صفحة مشروع
  const isProjectPage =
    location.pathname.includes("/projects/") &&
    projectId &&
    !location.pathname.endsWith("/projects") &&
    !location.pathname.endsWith("/create");

  // إغلاق الشريط الجانبي على الجوال تلقائيًا
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize(); // التشغيل الأولي
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // إغلاق الشريط الجانبي عند تغيير الصفحة على الجوال
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  if (!isProjectPage) return null;

  return (
    <ProjectSidebar
      isOpen={sidebarOpen}
      onToggle={() => setSidebarOpen(!sidebarOpen)}
      isAlwaysOpen={window.innerWidth >= 1024}
    />
  );
}
