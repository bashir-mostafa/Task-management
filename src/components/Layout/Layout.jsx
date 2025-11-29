import React, { useState, useEffect, useMemo, useCallback } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import DirectionHandler from "../DirectionHandler/DirectionHandler";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Layout() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);
  const closeSidebar = useCallback(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  const margin = useMemo(() => 
    isSidebarOpen ? (isRTL ? "mr-52" : "ml-52") : (isRTL ? "mr-12" : "ml-12"),
    [isSidebarOpen, isRTL]
  );

  useEffect(() => {
    const handleResize = () => {
      const shouldBeOpen = window.innerWidth >= 1024;
      setIsSidebarOpen(shouldBeOpen);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const overlayClickHandler = useCallback(() => {
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  }, [toggleSidebar]);

  return (
    <>
      <DirectionHandler />
      <div className="flex min-h-screen bg-background relative">
        {/* Overlay يجب يكون تحت السايدبار */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={overlayClickHandler}
          ></div>
        )}

        {/* السايدبار يجب يكون فوق الـ Overlay */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar}
          closeSidebar={closeSidebar}
          isRTL={isRTL} 
        />

        <div className={`flex-1 flex flex-col transition-all duration-200 ${margin} relative z-10`}>
          <Navbar 
            toggleSidebar={toggleSidebar} 
            isSidebarOpen={isSidebarOpen} 
            isRTL={isRTL} 
          />
          <main className="flex-1 bg-background text-text p-3 sm:p-4 md:p-6 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}