import React from "react";
import { useTranslation } from "react-i18next";

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen p-6 bg-background text-text transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-6 text-text">{t("welcome")}</h1>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Primary Card */}
        <div className="p-6 bg-primary text-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
          <h3 className="text-xl font-semibold mb-3">{t("primaryCard")}</h3>
          <p className="text-white/80">{t("primaryDescription")}</p>
        </div>

        {/* Secondary Card */}
        <div className="p-6 bg-secondary text-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
          <h3 className="text-xl font-semibold mb-3">{t("secondaryCard")}</h3>
          <p className="text-white/80">{t("secondaryDescription")}</p>
        </div>

        {/* Accent Card */}
        <div className="p-6 bg-accent text-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
          <h3 className="text-xl font-semibold mb-3">{t("accentCard")}</h3>
          <p className="text-white/80">{t("accentDescription")}</p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-navbar-light dark:bg-navbar-dark rounded-lg text-center">
          <div className="text-2xl font-bold text-navbar-text-light dark:text-navbar-text-dark">
            42
          </div>
          <div className="text-sm text-navbar-text-light/70 dark:text-navbar-text-dark/70">
            {t("users")}
          </div>
        </div>

        <div className="p-4 bg-navbar-light dark:bg-navbar-dark rounded-lg text-center">
          <div className="text-2xl font-bold text-navbar-text-light dark:text-navbar-text-dark">
            128
          </div>
          <div className="text-sm text-navbar-text-light/70 dark:text-navbar-text-dark/70">
            {t("projects")}
          </div>
        </div>

        <div className="p-4 bg-navbar-light dark:bg-navbar-dark rounded-lg text-center">
          <div className="text-2xl font-bold text-navbar-text-light dark:text-navbar-text-dark">
            24
          </div>
          <div className="text-sm text-navbar-text-light/70 dark:text-navbar-text-dark/70">
            {t("tasks")}
          </div>
        </div>

        <div className="p-4 bg-navbar-light dark:bg-navbar-dark rounded-lg text-center">
          <div className="text-2xl font-bold text-navbar-text-light dark:text-navbar-text-dark">
            95%
          </div>
          <div className="text-sm text-navbar-text-light/70 dark:text-navbar-text-dark/70">
            {t("efficiency")}
          </div>
        </div>
      </section>
    </div>
  );
}
