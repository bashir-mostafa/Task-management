// src/pages/login/components/IllustrativePanel.jsx
import React from "react";
import { CheckCircle, Clock, Users, BarChart3, Calendar, Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import MockHeader from "./MockHeader";
import StatsGrid from "./StatsGrid";
import TaskList from "./TaskList";
import ProgressBar from "./ProgressBar";
import DecorativeElements from "./DecorativeElements";

export default function IllustrativePanel({ isRTL }) {
  const { t } = useTranslation();

  return (
    <div className="hidden lg:flex flex-1 items-center justify-center p-8 z-10">
      <div className="max-w-2xl w-full h-[600px] bg-gradient-to-br from-blue-50/80 to-indigo-100/80 dark:from-gray-800/80 dark:to-gray-700/80 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-600/50 overflow-hidden relative backdrop-blur-sm">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 animate-pulse"></div>
        
        {/* Main Panel */}
        <div className="absolute inset-6 bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-2xl p-6 backdrop-blur-sm border border-gray-100 dark:border-gray-700">
          <MockHeader t={t} />
          <StatsGrid t={t} />
          <TaskList t={t} />
          <ProgressBar t={t} />
        </div>

        {/* Decorative Elements */}
        <DecorativeElements />
      </div>
    </div>
  );
}