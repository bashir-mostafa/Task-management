import React, { useState, useEffect, useMemo } from "react";
import { Outlet, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProjectSidebar from "../sidebar/ProjectSidebar";

export default function ProjectLayout() {
  const { projectId } = useParams();
  const location = useLocation();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  
  const [isProjectSidebarOpen, setIsProjectSidebarOpen] = useState(true);
  
  // التحقق من المسارات التي يجب أن تظهر فيها السايدبار
  const shouldShowProjectSidebar = useMemo(() => {
    const path = location.pathname;
    
    // استبعاد بعض الصفحات التي لا تحتاج سايدبار المشروع
    const excludePaths = [
      '/export',
      '/activity',
      '/notifications',
      '/messages'
    ];
    
    const isExcluded = excludePaths.some(exclude => path.includes(exclude));
    return !isExcluded;
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsProjectSidebarOpen(false);
      } else {
        setIsProjectSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!projectId || !shouldShowProjectSidebar) {
    return <Outlet />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* المحتوى الرئيسي */}
      <main className={`flex-1 transition-all duration-300 ${
        isProjectSidebarOpen 
          ? isRTL 
            ? 'pr-64 md:pr-80' 
            : 'pl-64 md:pl-80'
          : isRTL
            ? 'pr-0'
            : 'pl-0'
      }`}>
        <Outlet />
      </main>
      
      {/* سايدبار المشروع */}
      <div className={`fixed top-0 h-screen transition-transform duration-300 z-40 ${
        isRTL ? 'right-0' : 'left-0'
      } ${
        isProjectSidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
      } md:relative md:translate-x-0`}>
        <ProjectSidebar 
          isOpen={isProjectSidebarOpen}
          onToggle={() => setIsProjectSidebarOpen(!isProjectSidebarOpen)}
        />
      </div>
    </div>
  );
}