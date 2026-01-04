import React, { useState, useEffect, useMemo, useCallback } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import DirectionHandler from "../DirectionHandler/DirectionHandler";
import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProjectSidebar from "../sidebar/ProjectSidebar";

export default function Layout() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const isRTL = i18n.language === "ar";

  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(() => 
    window.innerWidth >= 1024
  );
  
  const [isProjectSidebarOpen, setIsProjectSidebarOpen] = useState(false);

  // التحقق إذا كنا في صفحة تفاصيل المشروع أو صفحاته الفرعية
  const { isProjectPage, projectId } = useMemo(() => {
    const path = location.pathname;
    const parts = path.split('/').filter(Boolean);
    
    let isProject = false;
    let id = null;

    // تحقق من المسار: /projects/:projectId
    if (parts.length >= 2 && parts[0] === 'projects') {
      
      // استخراج projectId (الجزء الثاني بعد projects)
      id = parts[1];
      
      // استبعاد كلمة "create" إذا كانت projectId
      if (id === 'create') {
        return { isProjectPage: false, projectId: null };
      }
      
      // تحقق من الصفحات الفرعية التي يجب أن تظهر فيها Project Sidebar
      const validSubpages = [
        '', // صفحة التفاصيل الرئيسية
        'tasks',
        'users',
        'edit',
        'export',
        'activity',
        'notifications',
        'messages'
      ];
      
      // إذا كان لدينا projectId فقط (2 أجزاء) أو مع صفحة فرعية صالحة
      if (parts.length === 2) {
        // المسار: /projects/:projectId
        isProject = true;
      } else if (parts.length >= 3 && validSubpages.includes(parts[2])) {
        // المسار: /projects/:projectId/صفحة-فرعية
        isProject = true;
      }
    }
    
    return { isProjectPage: isProject, projectId: id };
  }, [location.pathname]);

  const toggleMainSidebar = useCallback(
    () => setIsMainSidebarOpen((prev) => !prev),
    []
  );
  
  const toggleProjectSidebar = useCallback(
    () => setIsProjectSidebarOpen((prev) => !prev),
    []
  );

  // حساب الهوامش والتنسيق
  const getLayoutStyles = useMemo(() => {
    const isDesktop = window.innerWidth >= 1024;
    const styles = {
      mainContent: '',
      projectSidebarClass: '',
      shouldShowProjectSidebar: isProjectPage && projectId,
    };

    // حساب هامش المحتوى الرئيسي
    if (isProjectPage) {
      // في صفحات المشروع
      if (isDesktop) {
        // على سطح المكتب: Project Sidebar مفتوح
        if (isProjectSidebarOpen) {
          styles.mainContent = isRTL ? 'mr-64' : 'ml-64';
        }
      } else if (isProjectSidebarOpen) {
        // على الجوال مع Project Sidebar مفتوح
        styles.mainContent = isRTL ? 'mr-64' : 'ml-64';
      }
      
      // كلاس Project Sidebar
      styles.projectSidebarClass = `fixed top-0 h-screen transition-transform duration-300 z-45 ${
        isRTL ? 'right-0' : 'left-0'
      } ${
        isProjectSidebarOpen 
          ? 'translate-x-0 shadow-2xl' 
          : isRTL 
            ? 'translate-x-full' 
            : '-translate-x-full'
      } lg:translate-x-0 lg:shadow-none`;
      
    } else {
      // في الصفحات الأخرى
      if (isMainSidebarOpen) {
        styles.mainContent = isRTL ? 'mr-52' : 'ml-52';
      }else{
        styles.mainContent = isRTL ? 'mr-16' : 'ml-16';
      }
    }

    return styles;
  }, [isMainSidebarOpen, isProjectSidebarOpen, isRTL, isProjectPage, projectId]);

  // تأثيرات للتحكم في فتح/إغلاق السايدبارات
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      
      if (isProjectPage) {
        // في صفحات المشروع
        if (isDesktop) {
          // على سطح المكتب: فتح Project Sidebar، إغلاق Main Sidebar
          setIsProjectSidebarOpen(true);
          setIsMainSidebarOpen(false);
        } else {
          // على الجوال: إغلاق كليهما افتراضيًا
          setIsProjectSidebarOpen(false);
          setIsMainSidebarOpen(false);
        }
      } else {
        // في الصفحات الأخرى
        setIsProjectSidebarOpen(false);
        if (isDesktop) {
          setIsMainSidebarOpen(true);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [isProjectPage]);

  // تأثير عند تغيير المسار
  useEffect(() => {
    const isDesktop = window.innerWidth >= 1024;
    
    if (isProjectPage) {
      // عند دخول صفحة مشروع
      if (isDesktop) {
        setIsProjectSidebarOpen(true);
        setIsMainSidebarOpen(false);
      } else {
        // على الجوال، يمكن فتح Project Sidebar تلقائيًا أو تركه مغلقًا
        setIsProjectSidebarOpen(true); // يمكنك تغييره إلى false إذا تريده مغلقًا افتراضيًا
      }
    } else {
      // عند الخروج من صفحة مشروع
      setIsProjectSidebarOpen(false);
      if (isDesktop) {
        setIsMainSidebarOpen(true);
      }
    }
  }, [isProjectPage]);

  const handleOverlayClick = useCallback(() => {
    if (window.innerWidth < 1024) {
      if (isProjectPage) {
        setIsProjectSidebarOpen(false);
      } else {
        setIsMainSidebarOpen(false);
      }
    }
  }, [isProjectPage]);

  const getNavbarToggle = useCallback(() => {
    if (isProjectPage) {
      return window.innerWidth < 1024 ? toggleProjectSidebar : undefined;
    }
    return toggleMainSidebar;
  }, [isProjectPage, toggleProjectSidebar, toggleMainSidebar]);

  // حالة السايدبار المفتوح للـ Navbar
  const getNavbarSidebarState = useCallback(() => {
    if (isProjectPage) {
      return isProjectSidebarOpen;
    }
    return isMainSidebarOpen;
  }, [isProjectPage, isProjectSidebarOpen, isMainSidebarOpen]);

  return (
    <>
      <DirectionHandler />
      <div className="flex min-h-screen bg-background relative">
        {(isMainSidebarOpen || (isProjectPage && isProjectSidebarOpen)) && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={handleOverlayClick}
          />
        )}

        {(!isProjectPage || window.innerWidth < 1024) && (
          <Sidebar
            isOpen={isMainSidebarOpen}
            toggleSidebar={toggleMainSidebar}
            isRTL={isRTL}
          />
        )}

        {getLayoutStyles.shouldShowProjectSidebar && (
          <div className={getLayoutStyles.projectSidebarClass}>
            <ProjectSidebar
              isOpen={isProjectSidebarOpen}
              onToggle={toggleProjectSidebar}
              projectId={projectId}
              isAlwaysOpen={window.innerWidth >= 1024}
            />
          </div>
        )}

        {/* المحتوى الرئيسي */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            getLayoutStyles.mainContent
          } relative z-10 min-w-0 w-full`}
        >
          <Navbar
            toggleSidebar={getNavbarToggle()}
            isSidebarOpen={getNavbarSidebarState()}
            isRTL={isRTL}
            isProjectPage={isProjectPage}
            projectId={projectId}
          />
          
          <main className="flex-1 bg-background text-text p-3 sm:p-4 md:p-6 mt-16 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}