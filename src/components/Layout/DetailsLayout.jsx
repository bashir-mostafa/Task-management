// src/components/Layout/DetailsLayout.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../UI/Button";

export default function DetailsLayout({
  children,
  title,
  subtitle,
  id,
  status,
  statusColors = {},
  statusIcons = {},
  statusTexts = {},
  loading = false,
  error = null,
  onEdit,
  onDelete,
  onBack,
  backLabel,
  showHeader = true,
  isRTL = false,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
          role="status"
          aria-label="Loading"
        >
          <span className="sr-only">{t("loading")}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <div className="text-red-500 text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-text mb-4">{error}</h2>
        <Button onClick={onBack} className="!w-auto px-6 py-3">
          {backLabel || t("back")}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text">
      {showHeader && (
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-4">
            <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
              <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                <Button
                  onClick={onBack}
                  variant="secondary"
                  className={`flex items-center gap-2 h-10 !w-auto px-4 py-2 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <ArrowLeft size={20} />
                  <span>{backLabel || t("back")}</span>
                </Button>

                <div className={isRTL ? "text-right" : "text-left"}>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {title}
                  </h1>
                  <div className="flex items-center gap-5 mt-2">
                    {status && (
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${
                          statusColors[status] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {statusIcons[status]}
                        {statusTexts[status] || status}
                      </span>
                    )}
                   
                  </div>
                  
                </div>
              </div>

              <div className="flex items-center gap-2 w-50 ">
                {onEdit && (
                  <Button
                    onClick={onEdit}
                    variant="secondary"
                    className={`flex items-center h-10 p-5  gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <Edit size={16} />
                    <span>{t("edit")}</span>
                  </Button>
                )}
                {onDelete && (
                  <Button
                    onClick={onDelete}
                    variant="danger"
                    className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <Trash2 size={16} />
                    <span>{t("delete")}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  );
}